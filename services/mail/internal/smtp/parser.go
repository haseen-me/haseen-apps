package smtp

import (
	"io"
	"mime"
	"mime/multipart"
	"net/mail"
	"strings"

	"github.com/haseen-me/haseen-apps/services/mail/internal/store"
)

type ParsedAttachment struct {
	Filename    string
	ContentType string
	Data        []byte
}

type ParsedMessage struct {
	From         string
	Subject      string
	BodyHTML     string
	BodyText     string
	MessageID    string
	InReplyTo    string
	References   []string
	Attachments  []ParsedAttachment
}

func parseIncomingMessage(msg *mail.Message) ParsedMessage {
	from := msg.Header.Get("From")
	if addresses, err := msg.Header.AddressList("From"); err == nil && len(addresses) > 0 {
		from = addresses[0].Address
	}

	references := strings.Fields(msg.Header.Get("References"))
	parsed := ParsedMessage{
		From:       from,
		Subject:    msg.Header.Get("Subject"),
		MessageID:  strings.TrimSpace(msg.Header.Get("Message-ID")),
		InReplyTo:  strings.TrimSpace(msg.Header.Get("In-Reply-To")),
		References: references,
	}

	bodyHTML, bodyText, attachments := extractBody(msg.Header.Get("Content-Type"), msg.Body)
	parsed.BodyHTML = bodyHTML
	parsed.BodyText = bodyText
	parsed.Attachments = attachments
	return parsed
}

func extractBody(contentType string, body io.Reader) (html string, text string, attachments []ParsedAttachment) {
	if contentType == "" {
		contentType = "text/plain"
	}

	mediaType, params, err := mime.ParseMediaType(contentType)
	if err != nil {
		data, _ := io.ReadAll(io.LimitReader(body, maxMessageSize))
		return "", string(data), nil
	}

	if strings.HasPrefix(mediaType, "multipart/") {
		reader := multipart.NewReader(body, params["boundary"])
		for {
			part, err := reader.NextPart()
			if err != nil {
				break
			}
			partType := part.Header.Get("Content-Type")
			disposition, _, _ := mime.ParseMediaType(part.Header.Get("Content-Disposition"))
			data, _ := io.ReadAll(io.LimitReader(part, maxMessageSize))

			if strings.HasPrefix(partType, "multipart/") {
				nestedHTML, nestedText, nestedAttachments := extractBody(partType, strings.NewReader(string(data)))
				if html == "" {
					html = nestedHTML
				}
				if text == "" {
					text = nestedText
				}
				attachments = append(attachments, nestedAttachments...)
				part.Close()
				continue
			}

			filename := part.FileName()
			if disposition == "attachment" || filename != "" {
				attachments = append(attachments, ParsedAttachment{
					Filename:    filename,
					ContentType: fallbackContentType(partType),
					Data:        data,
				})
				part.Close()
				continue
			}

			if strings.HasPrefix(partType, "text/html") {
				html = string(data)
			} else if strings.HasPrefix(partType, "text/plain") || partType == "" {
				text = string(data)
			}
			part.Close()
		}
		if html == "" && text != "" {
			html = "<pre>" + text + "</pre>"
		}
		if text == "" && html != "" {
			text = store.StripHTMLHelper(html)
		}
		return html, text, attachments
	}

	data, _ := io.ReadAll(io.LimitReader(body, maxMessageSize))
	if strings.HasPrefix(mediaType, "text/html") {
		return string(data), store.StripHTMLHelper(string(data)), nil
	}
	return "<pre>" + string(data) + "</pre>", string(data), nil
}

func fallbackContentType(contentType string) string {
	if strings.TrimSpace(contentType) == "" {
		return "application/octet-stream"
	}
	return contentType
}
