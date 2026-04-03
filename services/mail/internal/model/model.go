package model

import "time"

// ---------- Address ----------

type EmailAddress struct {
	Name    string `json:"name,omitempty"`
	Address string `json:"address"`
}

// ---------- Mailbox ----------

type Mailbox struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
}

// ---------- Label ----------

type Label struct {
	ID        string `json:"id"`
	MailboxID string `json:"-"`
	Name      string `json:"name"`
	Color     string `json:"color,omitempty"`
	IsSystem  bool   `json:"isSystem"`
}

// ---------- Attachment ----------

type Attachment struct {
	ID          string `json:"id"`
	MessageID   string `json:"-"`
	Filename    string `json:"filename"`
	ContentType string `json:"contentType"`
	Size        int64  `json:"size"`
}

// ---------- Message ----------

type Message struct {
	ID          string         `json:"id"`
	ThreadID    string         `json:"threadId"`
	From        EmailAddress   `json:"from"`
	To          []EmailAddress `json:"to"`
	Cc          []EmailAddress `json:"cc"`
	Bcc         []EmailAddress `json:"bcc"`
	Subject     string         `json:"subject"`
	BodyHtml    string         `json:"bodyHtml"`
	BodyText    string         `json:"bodyText"`
	Attachments []Attachment   `json:"attachments"`
	Date        string         `json:"date"`
	Read        bool           `json:"read"`
	Starred     bool           `json:"starred"`
	Labels      []string       `json:"labels"`
	Encrypted   bool           `json:"encrypted"`
	// E2E envelope fields
	EncryptedSubject     string            `json:"encryptedSubject,omitempty"`
	EncryptedBody        string            `json:"encryptedBody,omitempty"`
	EncryptedSessionKeys map[string]string  `json:"encryptedSessionKeys,omitempty"`
}

// ---------- Thread ----------

type Thread struct {
	ID              string       `json:"id"`
	Subject         string       `json:"subject"`
	Messages        []Message    `json:"messages"`
	LastMessageDate string       `json:"lastMessageDate"`
	UnreadCount     int          `json:"unreadCount"`
	Labels          []string     `json:"labels"`
	Snippet         string       `json:"snippet"`
	From            EmailAddress `json:"from"`
	HasAttachments  bool         `json:"hasAttachments"`
}

// ---------- API Requests ----------

type SendMessageRequest struct {
	To               []EmailAddress        `json:"to"`
	Cc               []EmailAddress        `json:"cc"`
	Bcc              []EmailAddress        `json:"bcc"`
	Subject          string                `json:"subject"`
	BodyHtml         string                `json:"bodyHtml"`
	ReplyToMessageID string                `json:"replyToMessageId,omitempty"`
	// E2E envelope fields (optional — stored alongside plaintext)
	EncryptedSubject     string            `json:"encryptedSubject,omitempty"`
	EncryptedBody        string            `json:"encryptedBody,omitempty"`
	EncryptedSessionKeys map[string]string  `json:"encryptedSessionKeys,omitempty"`
}

type UpdateMessageRequest struct {
	Read    *bool    `json:"read,omitempty"`
	Starred *bool    `json:"starred,omitempty"`
	Labels  []string `json:"labels,omitempty"`
}

type MoveMessageRequest struct {
	Label string `json:"label"`
}

type CreateLabelRequest struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type UpdateLabelRequest struct {
	Name  *string `json:"name,omitempty"`
	Color *string `json:"color,omitempty"`
}

type SearchRequest struct {
	Query string `json:"query"`
}

// ---------- API Responses ----------

type MailboxResponse struct {
	Threads []Thread `json:"threads"`
	Total   int      `json:"total"`
}

type SendResponse struct {
	ID string `json:"id"`
}

type OkResponse struct {
	OK bool `json:"ok"`
}

type SearchResponse struct {
	Threads []Thread `json:"threads"`
}
