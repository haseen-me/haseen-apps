package smtp

import (
	"bufio"
	"bytes"
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"net"
	"net/mail"
	"strings"
	"time"

	"github.com/haseen-me/haseen-apps/services/mail/internal/store"
	"github.com/rs/zerolog"
)

type Session struct {
	conn     net.Conn
	server   *Server
	log      zerolog.Logger
	reader   *bufio.Reader
	writer   *bufio.Writer
	helo     string
	mailFrom string
	rcptTo   []string
	tls      bool
}

func (s *Session) serve() {
	defer s.conn.Close()

	s.reader = bufio.NewReader(s.conn)
	s.writer = bufio.NewWriter(s.conn)

	s.writeLine("220 %s ESMTP Haseen Mail", s.server.Domain)

	for {
		s.conn.SetReadDeadline(time.Now().Add(readTimeout))
		line, err := s.reader.ReadString('\n')
		if err != nil {
			if err != io.EOF {
				s.log.Debug().Err(err).Msg("read error")
			}
			return
		}
		line = strings.TrimRight(line, "\r\n")
		if line == "" {
			continue
		}

		cmd, arg := parseCommand(line)
		switch cmd {
		case "HELO":
			s.handleHELO(arg)
		case "EHLO":
			s.handleEHLO(arg)
		case "STARTTLS":
			s.handleSTARTTLS()
		case "MAIL":
			s.handleMAIL(arg)
		case "RCPT":
			s.handleRCPT(arg)
		case "DATA":
			s.handleDATA()
		case "RSET":
			s.handleRSET()
		case "NOOP":
			s.writeLine("250 OK")
		case "QUIT":
			s.writeLine("221 Bye")
			return
		case "VRFY":
			s.writeLine("252 Cannot VRFY user")
		default:
			s.writeLine("502 Command not recognized")
		}
	}
}

func (s *Session) handleHELO(arg string) {
	if arg == "" {
		s.writeLine("501 Syntax: HELO hostname")
		return
	}
	s.helo = arg
	s.reset()
	s.writeLine("250 %s", s.server.Domain)
}

func (s *Session) handleEHLO(arg string) {
	if arg == "" {
		s.writeLine("501 Syntax: EHLO hostname")
		return
	}
	s.helo = arg
	s.reset()
	s.writeLine("250-%s", s.server.Domain)
	s.writeLine("250-SIZE %d", maxMessageSize)
	s.writeLine("250-8BITMIME")
	s.writeLine("250-PIPELINING")
	if s.server.TLSConfig != nil && !s.tls {
		s.writeLine("250-STARTTLS")
	}
	s.writeLine("250 OK")
}

func (s *Session) handleSTARTTLS() {
	if s.server.TLSConfig == nil {
		s.writeLine("454 TLS not available")
		return
	}
	if s.tls {
		s.writeLine("503 Already using TLS")
		return
	}
	s.writeLine("220 Ready to start TLS")
	s.writer.Flush()

	tlsConn := tls.Server(s.conn, s.server.TLSConfig)
	if err := tlsConn.Handshake(); err != nil {
		s.log.Error().Err(err).Msg("TLS handshake failed")
		return
	}
	s.conn = tlsConn
	s.reader = bufio.NewReader(tlsConn)
	s.writer = bufio.NewWriter(tlsConn)
	s.tls = true
	s.reset()
}

func (s *Session) handleMAIL(arg string) {
	if s.helo == "" {
		s.writeLine("503 Say HELO/EHLO first")
		return
	}
	if s.mailFrom != "" {
		s.writeLine("503 Sender already specified")
		return
	}

	from := extractMailParam(arg, "FROM")
	if from == "" {
		s.writeLine("501 Syntax: MAIL FROM:<address>")
		return
	}
	s.mailFrom = from
	s.writeLine("250 OK")
}

func (s *Session) handleRCPT(arg string) {
	if s.mailFrom == "" {
		s.writeLine("503 Need MAIL FROM first")
		return
	}
	if len(s.rcptTo) >= maxRecipients {
		s.writeLine("452 Too many recipients")
		return
	}

	to := extractMailParam(arg, "TO")
	if to == "" {
		s.writeLine("501 Syntax: RCPT TO:<address>")
		return
	}

	parts := strings.SplitN(to, "@", 2)
	if len(parts) != 2 {
		s.writeLine("550 Invalid address")
		return
	}
	recipientDomain := parts[1]

	// Accept mail for our primary domain or any verified custom domain
	if strings.EqualFold(recipientDomain, s.server.Domain) {
		_, err := s.server.Store.GetUserByEmail(context.Background(), to)
		if err != nil {
			s.writeLine("550 No such user")
			return
		}
	} else if s.server.Store.IsCustomDomain(context.Background(), recipientDomain) {
		_, err := s.server.Store.GetUserByDomainEmail(context.Background(), to)
		if err != nil {
			s.writeLine("550 No such user")
			return
		}
	} else {
		s.writeLine("550 Relay not permitted")
		return
	}

	s.rcptTo = append(s.rcptTo, to)
	s.writeLine("250 OK")
}

func (s *Session) handleDATA() {
	if s.mailFrom == "" || len(s.rcptTo) == 0 {
		s.writeLine("503 Need MAIL FROM and RCPT TO first")
		return
	}

	s.writeLine("354 Start mail input; end with <CRLF>.<CRLF>")
	s.writer.Flush()

	// Read message data until lone "."
	s.conn.SetReadDeadline(time.Now().Add(5 * time.Minute))
	var buf bytes.Buffer
	for {
		line, err := s.reader.ReadString('\n')
		if err != nil {
			s.log.Error().Err(err).Msg("DATA read error")
			return
		}
		trimmed := strings.TrimRight(line, "\r\n")
		if trimmed == "." {
			break
		}
		// Dot-stuffing: leading dot is removed
		if strings.HasPrefix(trimmed, ".") {
			line = line[1:]
		}
		if buf.Len() > maxMessageSize {
			s.writeLine("552 Message too large")
			s.reset()
			return
		}
		buf.WriteString(line)
	}

	// Parse the message
	if err := s.deliverMessage(buf.Bytes()); err != nil {
		s.log.Error().Err(err).Msg("delivery failed")
		s.writeLine("451 Delivery failed, try again later")
	} else {
		s.writeLine("250 OK: queued")
	}
	s.reset()
}

func (s *Session) deliverMessage(raw []byte) error {
	ctx := context.Background()

	msg, err := mail.ReadMessage(bytes.NewReader(raw))
	if err != nil {
		return fmt.Errorf("parse message: %w", err)
	}

	subject := msg.Header.Get("Subject")
	from := s.mailFrom
	toAddrs := s.rcptTo

	// Extract CC from headers
	var ccAddrs []string
	if cc := msg.Header.Get("Cc"); cc != "" {
		addrs, _ := msg.Header.AddressList("Cc")
		for _, a := range addrs {
			ccAddrs = append(ccAddrs, a.Address)
		}
	}

	// Parse body — handle MIME multipart or plain text
	bodyHTML, bodyText := parseBody(msg)

	// Deliver to each local recipient
	for _, rcpt := range toAddrs {
		rcptParts := strings.SplitN(rcpt, "@", 2)
		var userID string
		if len(rcptParts) == 2 && strings.EqualFold(rcptParts[1], s.server.Domain) {
			uid, err := s.server.Store.GetUserByEmail(ctx, rcpt)
			if err != nil {
				s.log.Warn().Str("rcpt", rcpt).Msg("recipient not found, skipping")
				continue
			}
			userID = uid
		} else {
			uid, err := s.server.Store.GetUserByDomainEmail(ctx, rcpt)
			if err != nil {
				s.log.Warn().Str("rcpt", rcpt).Msg("custom domain recipient not found, skipping")
				continue
			}
			userID = uid
		}

		mb, err := s.server.Store.EnsureMailbox(ctx, userID)
		if err != nil {
			return fmt.Errorf("ensure mailbox for %s: %w", rcpt, err)
		}
		_ = s.server.Store.EnsureSystemLabels(ctx, mb.ID)

		inboxLabel, err := s.server.Store.GetLabelByName(ctx, mb.ID, "Inbox")
		if err != nil {
			return fmt.Errorf("get inbox label: %w", err)
		}

		// Thread by subject
		threadID, err := s.server.Store.FindThreadBySubject(ctx, mb.ID, subject)
		if err != nil {
			threadID, err = s.server.Store.CreateThread(ctx, mb.ID)
			if err != nil {
				return fmt.Errorf("create thread: %w", err)
			}
		}

		_, err = s.server.Store.CreateInboundMessage(ctx, mb.ID, threadID, inboxLabel.ID,
			from, toAddrs, ccAddrs, subject, bodyHTML, bodyText,
		)
		if err != nil {
			return fmt.Errorf("store message for %s: %w", rcpt, err)
		}

		s.log.Info().
			Str("from", from).
			Str("to", rcpt).
			Str("subject", subject).
			Msg("message delivered")
	}
	return nil
}

func (s *Session) handleRSET() {
	s.reset()
	s.writeLine("250 OK")
}

func (s *Session) reset() {
	s.mailFrom = ""
	s.rcptTo = nil
}

func (s *Session) writeLine(format string, args ...interface{}) {
	line := fmt.Sprintf(format, args...)
	s.writer.WriteString(line + "\r\n")
	s.writer.Flush()
}

// ---------- Helpers ----------

func parseCommand(line string) (string, string) {
	parts := strings.SplitN(line, " ", 2)
	cmd := strings.ToUpper(parts[0])
	arg := ""
	if len(parts) > 1 {
		arg = parts[1]
	}
	return cmd, arg
}

func extractMailParam(arg, prefix string) string {
	upper := strings.ToUpper(arg)
	idx := strings.Index(upper, prefix+":")
	if idx < 0 {
		return ""
	}
	rest := arg[idx+len(prefix)+1:]
	rest = strings.TrimSpace(rest)
	// Strip angle brackets
	if strings.HasPrefix(rest, "<") && strings.HasSuffix(rest, ">") {
		rest = rest[1 : len(rest)-1]
	}
	return rest
}

// parseBody extracts HTML and plain text from a MIME message.
func parseBody(msg *mail.Message) (html string, text string) {
	contentType := msg.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "text/plain"
	}

	mediaType, params, err := mime.ParseMediaType(contentType)
	if err != nil {
		// Fallback: read entire body as text
		body, _ := io.ReadAll(io.LimitReader(msg.Body, maxMessageSize))
		return "", string(body)
	}

	if strings.HasPrefix(mediaType, "multipart/") {
		boundary := params["boundary"]
		if boundary == "" {
			body, _ := io.ReadAll(io.LimitReader(msg.Body, maxMessageSize))
			return "", string(body)
		}
		mr := multipart.NewReader(msg.Body, boundary)
		for {
			part, err := mr.NextPart()
			if err != nil {
				break
			}
			partType := part.Header.Get("Content-Type")
			partBody, _ := io.ReadAll(io.LimitReader(part, maxMessageSize))

			if strings.HasPrefix(partType, "text/html") {
				html = string(partBody)
			} else if strings.HasPrefix(partType, "text/plain") || partType == "" {
				text = string(partBody)
			}
			part.Close()
		}
		if html == "" && text != "" {
			html = "<pre>" + text + "</pre>"
		}
		return html, text
	}

	body, _ := io.ReadAll(io.LimitReader(msg.Body, maxMessageSize))
	if strings.HasPrefix(mediaType, "text/html") {
		return string(body), store.StripHTMLHelper(string(body))
	}
	return "<pre>" + string(body) + "</pre>", string(body)
}
