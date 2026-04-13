package model

import "time"

type ContactRecord struct {
	ID            string    `json:"id"`
	UserID        string    `json:"-"`
	EncryptedData string    `json:"encryptedData"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type UpsertContactRequest struct {
	EncryptedData string `json:"encryptedData"`
}

type ListResponse struct {
	Contacts []ContactRecord `json:"contacts"`
	Total    int             `json:"total"`
}

type OkResponse struct {
	OK bool `json:"ok"`
}
