package smtp

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"sort"
	"strings"
	"time"

	"github.com/rs/zerolog"
)

type Sender struct {
	Domain string
	Log    zerolog.Logger
}

func NewSender(domain string, log zerolog.Logger) *Sender {
	return &Sender{
		Domain: domain,
		Log:    log.With().Str("component", "smtp-sender").Logger(),
	}
}

type Envelope struct {
	From    string
	To      []string
	Subject string
	HTML    string
	Text    string
	Headers map[string]string
}

func (s *Sender) Send(env *Envelope) error {
	grouped := groupByDomain(env.To)
	var lastErr error
	for domain, rcpts := range grouped {
		if err := s.deliverToDomain(env, domain, rcpts); err != nil {
			s.Log.Error().Err(err).Str("domain", domain).Msg("delivery failed")
			lastErr = err
		}
	}
	return lastErr
}

func (s *Sender) deliverToDomain(env *Envelope, domain string, rcpts []string) error {
	mxRecords, err := lookupMX(domain)
	if err != nil || len(mxRecords) == 0 {
		mxRecords = []string{domain}
	}

	var lastErr error
	for _, mx := range mxRecords {
		if err := s.deliverToHost(env, mx, rcpts); err != nil {
			lastErr = err
			continue
		}
		return nil
	}
	return fmt.Errorf("all MX hosts failed for %s: %w", domain, lastErr)
}

func (s *Sender) deliverToHost(env *Envelope, host string, rcpts []string) error {
	addr := host + ":25"
	conn, err := net.DialTimeout("tcp", addr, 30*time.Second)
	if err != nil {
		return fmt.Errorf("connect to %s: %w", addr, err)
	}
	defer conn.Close()

	conn.SetDeadline(time.Now().Add(5 * time.Minute))

	reader := bufio.NewReader(conn)
	writer := bufio.NewWriter(conn)

	// Read greeting
	if _, err := readResponse(reader, 220); err != nil {
		return fmt.Errorf("greeting: %w", err)
	}

	// EHLO
	writeLine(writer, "EHLO %s", s.Domain)
	resp, err := readResponse(reader, 250)
	if err != nil {
		// Fallback to HELO
		writeLine(writer, "HELO %s", s.Domain)
		if _, err := readResponse(reader, 250); err != nil {
			return fmt.Errorf("HELO: %w", err)
		}
	}

	// Try STARTTLS if advertised
	if strings.Contains(strings.ToUpper(resp), "STARTTLS") {
		writeLine(writer, "STARTTLS")
		if _, err := readResponse(reader, 220); err == nil {
			tlsConn := tls.Client(conn, &tls.Config{
				ServerName:         host,
				InsecureSkipVerify: false,
			})
			if err := tlsConn.Handshake(); err == nil {
				conn = tlsConn
				reader = bufio.NewReader(tlsConn)
				writer = bufio.NewWriter(tlsConn)
				writeLine(writer, "EHLO %s", s.Domain)
				readResponse(reader, 250)
			}
		}
	}

	// MAIL FROM
	writeLine(writer, "MAIL FROM:<%s>", env.From)
	if _, err := readResponse(reader, 250); err != nil {
		return fmt.Errorf("MAIL FROM: %w", err)
	}

	// RCPT TO
	for _, rcpt := range rcpts {
		writeLine(writer, "RCPT TO:<%s>", rcpt)
		if _, err := readResponse(reader, 250); err != nil {
			s.Log.Warn().Str("rcpt", rcpt).Err(err).Msg("RCPT TO rejected")
		}
	}

	// DATA
	writeLine(writer, "DATA")
	if _, err := readResponse(reader, 354); err != nil {
		return fmt.Errorf("DATA: %w", err)
	}

	// Write message content
	writeMessage(writer, env)
	writer.WriteString("\r\n.\r\n")
	writer.Flush()

	if _, err := readResponse(reader, 250); err != nil {
		return fmt.Errorf("DATA end: %w", err)
	}

	// QUIT
	writeLine(writer, "QUIT")
	readResponse(reader, 221)

	s.Log.Info().
		Str("host", host).
		Strs("rcpts", rcpts).
		Str("subject", env.Subject).
		Msg("message sent")

	return nil
}

// ---------- Helpers ----------

func lookupMX(domain string) ([]string, error) {
	records, err := net.LookupMX(domain)
	if err != nil {
		return nil, err
	}
	sort.Slice(records, func(i, j int) bool {
		return records[i].Pref < records[j].Pref
	})
	hosts := make([]string, len(records))
	for i, r := range records {
		hosts[i] = strings.TrimSuffix(r.Host, ".")
	}
	return hosts, nil
}

func groupByDomain(addrs []string) map[string][]string {
	m := make(map[string][]string)
	for _, addr := range addrs {
		parts := strings.SplitN(addr, "@", 2)
		if len(parts) != 2 {
			continue
		}
		domain := strings.ToLower(parts[1])
		m[domain] = append(m[domain], addr)
	}
	return m
}

func writeLine(w *bufio.Writer, format string, args ...interface{}) {
	fmt.Fprintf(w, format+"\r\n", args...)
	w.Flush()
}

func readResponse(r *bufio.Reader, expectedCode int) (string, error) {
	var all strings.Builder
	for {
		line, err := r.ReadString('\n')
		if err != nil {
			return "", fmt.Errorf("read response: %w", err)
		}
		all.WriteString(line)
		// Multi-line response: "250-..." continues, "250 ..." is last
		if len(line) >= 4 && line[3] == ' ' {
			code := 0
			fmt.Sscanf(line, "%d", &code)
			if code != expectedCode {
				return all.String(), fmt.Errorf("expected %d, got: %s", expectedCode, strings.TrimSpace(line))
			}
			return all.String(), nil
		}
	}
}

func writeMessage(w *bufio.Writer, env *Envelope) {
	fmt.Fprintf(w, "From: %s\r\n", env.From)
	fmt.Fprintf(w, "To: %s\r\n", strings.Join(env.To, ", "))
	fmt.Fprintf(w, "Subject: %s\r\n", env.Subject)
	fmt.Fprintf(w, "Date: %s\r\n", time.Now().Format(time.RFC1123Z))
	fmt.Fprintf(w, "Message-ID: <%d@%s>\r\n", time.Now().UnixNano(), "mail."+env.From[strings.Index(env.From, "@")+1:])
	fmt.Fprintf(w, "MIME-Version: 1.0\r\n")

	for k, v := range env.Headers {
		fmt.Fprintf(w, "%s: %s\r\n", k, v)
	}

	if env.HTML != "" {
		boundary := fmt.Sprintf("----=_Haseen_%d", time.Now().UnixNano())
		fmt.Fprintf(w, "Content-Type: multipart/alternative; boundary=\"%s\"\r\n\r\n", boundary)

		if env.Text != "" {
			fmt.Fprintf(w, "--%s\r\n", boundary)
			fmt.Fprintf(w, "Content-Type: text/plain; charset=utf-8\r\n\r\n")
			writeEscaped(w, env.Text)
			fmt.Fprintf(w, "\r\n")
		}

		fmt.Fprintf(w, "--%s\r\n", boundary)
		fmt.Fprintf(w, "Content-Type: text/html; charset=utf-8\r\n\r\n")
		writeEscaped(w, env.HTML)
		fmt.Fprintf(w, "\r\n")

		fmt.Fprintf(w, "--%s--\r\n", boundary)
	} else {
		fmt.Fprintf(w, "Content-Type: text/plain; charset=utf-8\r\n\r\n")
		writeEscaped(w, env.Text)
	}
}

func writeEscaped(w io.Writer, text string) {
	lines := strings.Split(text, "\n")
	for _, line := range lines {
		line = strings.TrimRight(line, "\r")
		if strings.HasPrefix(line, ".") {
			fmt.Fprintf(w, ".%s\r\n", line)
		} else {
			fmt.Fprintf(w, "%s\r\n", line)
		}
	}
}
