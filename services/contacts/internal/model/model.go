package model

import "time"

type Contact struct {
ID        string    `json:"id"`
UserID    string    `json:"-"`
Email     string    `json:"email"`
Name      string    `json:"name"`
Notes     string    `json:"notes,omitempty"`
CreatedAt time.Time `json:"createdAt"`
UpdatedAt time.Time `json:"updatedAt"`
}

type CreateContactRequest struct {
Email string `json:"email"`
Name  string `json:"name"`
Notes string `json:"notes,omitempty"`
}

type UpdateContactRequest struct {
Name  *string `json:"name,omitempty"`
Email *string `json:"email,omitempty"`
Notes *string `json:"notes,omitempty"`
}

type SearchRequest struct {
Query string `json:"query"`
}

type ListResponse struct {
Contacts []Contact `json:"contacts"`
Total    int       `json:"total"`
}

type OkResponse struct {
OK bool `json:"ok"`
}
