package model

import "time"

type CustomDomain struct {
	ID                string     `json:"id"`
	UserID            string     `json:"userId"`
	Domain            string     `json:"domain"`
	Status            string     `json:"status"`
	MXVerified        bool       `json:"mxVerified"`
	SPFVerified       bool       `json:"spfVerified"`
	DKIMVerified      bool       `json:"dkimVerified"`
	DMARCVerified     bool       `json:"dmarcVerified"`
	VerificationToken string     `json:"verificationToken"`
	LastCheckedAt     *time.Time `json:"lastCheckedAt,omitempty"`
	VerifiedAt        *time.Time `json:"verifiedAt,omitempty"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
}

type DKIMKey struct {
	ID            string     `json:"id"`
	DomainID      string     `json:"domainId"`
	Selector      string     `json:"selector"`
	PublicKey     string     `json:"publicKey"`
	KeySize       int        `json:"keySize"`
	Active        bool       `json:"active"`
	CreatedAt     time.Time  `json:"createdAt"`
	RotatedAt     *time.Time `json:"rotatedAt,omitempty"`
	PrivateKeyEnc []byte     `json:"-"`
	PrivateKeyIV  []byte     `json:"-"`
}

type DomainMailbox struct {
	ID          string    `json:"id"`
	DomainID    string    `json:"domainId"`
	UserID      string    `json:"userId"`
	LocalPart   string    `json:"localPart"`
	DisplayName string    `json:"displayName,omitempty"`
	IsCatchAll  bool      `json:"isCatchAll"`
	CreatedAt   time.Time `json:"createdAt"`
}

type OutboundMessage struct {
	ID           string     `json:"id"`
	UserID       string     `json:"userId"`
	DomainID     *string    `json:"domainId,omitempty"`
	FromAddress  string     `json:"fromAddress"`
	ToAddresses  []string   `json:"toAddresses"`
	CcAddresses  []string   `json:"ccAddresses,omitempty"`
	BccAddresses []string   `json:"bccAddresses,omitempty"`
	Subject      string     `json:"subject"`
	BodyHTML     string     `json:"bodyHtml"`
	BodyText     string     `json:"bodyText"`
	Status       string     `json:"status"`
	Attempts     int        `json:"attempts"`
	MaxAttempts  int        `json:"maxAttempts"`
	LastError    string     `json:"lastError,omitempty"`
	NextRetryAt  time.Time  `json:"nextRetryAt"`
	SentAt       *time.Time `json:"sentAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
}

type AttachmentRef struct {
	ID        string    `json:"id"`
	MessageID string    `json:"messageId"`
	Filename  string    `json:"filename"`
	MimeType  string    `json:"mimeType"`
	Size      int64     `json:"size"`
	R2Bucket  string    `json:"r2Bucket"`
	R2Key     string    `json:"r2Key"`
	CreatedAt time.Time `json:"createdAt"`
}

type DNSCheckLog struct {
	ID            string    `json:"id"`
	DomainID      string    `json:"domainId"`
	CheckType     string    `json:"checkType"`
	Passed        bool      `json:"passed"`
	ExpectedValue string    `json:"expectedValue,omitempty"`
	ActualValue   string    `json:"actualValue,omitempty"`
	CheckedAt     time.Time `json:"checkedAt"`
}

// --- API Requests ---

type AddDomainRequest struct {
	Domain string `json:"domain"`
}

type AddMailboxRequest struct {
	LocalPart   string `json:"localPart"`
	DisplayName string `json:"displayName"`
	IsCatchAll  bool   `json:"isCatchAll"`
}

type DomainDNSRecords struct {
	MX    DNSRecord `json:"mx"`
	SPF   DNSRecord `json:"spf"`
	DKIM  DNSRecord `json:"dkim"`
	DMARC DNSRecord `json:"dmarc"`
}

type DNSRecord struct {
	Type     string `json:"type"`
	Host     string `json:"host"`
	Value    string `json:"value"`
	Verified bool   `json:"verified"`
}

type DomainResponse struct {
	Domain     CustomDomain     `json:"domain"`
	DNSRecords DomainDNSRecords `json:"dnsRecords"`
	Mailboxes  []DomainMailbox  `json:"mailboxes"`
}
