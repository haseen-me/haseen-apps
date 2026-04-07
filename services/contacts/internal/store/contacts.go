package store

import (
"context"
"time"

"github.com/haseen-me/haseen-apps/services/contacts/internal/model"
)

func (s *Store) CreateContact(ctx context.Context, userID string, req *model.CreateContactRequest) (*model.Contact, error) {
c := &model.Contact{}
err := s.DB.QueryRow(ctx,
`INSERT INTO contacts (user_id, email, name, notes, phone, company, address, birthday)
 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
 ON CONFLICT (user_id, email) DO UPDATE SET name = EXCLUDED.name, notes = EXCLUDED.notes, phone = EXCLUDED.phone, company = EXCLUDED.company, address = EXCLUDED.address, birthday = EXCLUDED.birthday, updated_at = now()
 RETURNING id, email, name, notes, phone, company, address, birthday, created_at, updated_at`,
userID, req.Email, req.Name, req.Notes, req.Phone, req.Company, req.Address, req.Birthday,
).Scan(&c.ID, &c.Email, &c.Name, &c.Notes, &c.Phone, &c.Company, &c.Address, &c.Birthday, &c.CreatedAt, &c.UpdatedAt)
return c, err
}

func (s *Store) GetContact(ctx context.Context, userID, contactID string) (*model.Contact, error) {
c := &model.Contact{}
err := s.DB.QueryRow(ctx,
`SELECT id, email, name, notes, phone, company, address, birthday, created_at, updated_at
 FROM contacts WHERE id = $1 AND user_id = $2`,
contactID, userID,
).Scan(&c.ID, &c.Email, &c.Name, &c.Notes, &c.Phone, &c.Company, &c.Address, &c.Birthday, &c.CreatedAt, &c.UpdatedAt)
if err != nil {
return nil, ErrNotFound
}
return c, nil
}

func (s *Store) ListContacts(ctx context.Context, userID string) ([]model.Contact, error) {
rows, err := s.DB.Query(ctx,
`SELECT id, email, name, notes, phone, company, address, birthday, created_at, updated_at
 FROM contacts WHERE user_id = $1
 ORDER BY name ASC, email ASC`,
userID,
)
if err != nil {
return nil, err
}
defer rows.Close()

var contacts []model.Contact
for rows.Next() {
var c model.Contact
if err := rows.Scan(&c.ID, &c.Email, &c.Name, &c.Notes, &c.Phone, &c.Company, &c.Address, &c.Birthday, &c.CreatedAt, &c.UpdatedAt); err != nil {
return nil, err
}
contacts = append(contacts, c)
}
if contacts == nil {
contacts = []model.Contact{}
}
return contacts, rows.Err()
}

func (s *Store) UpdateContact(ctx context.Context, userID, contactID string, req *model.UpdateContactRequest) (*model.Contact, error) {
c, err := s.GetContact(ctx, userID, contactID)
if err != nil {
return nil, err
}
if req.Name != nil {
c.Name = *req.Name
}
if req.Email != nil {
c.Email = *req.Email
}
if req.Notes != nil {
c.Notes = *req.Notes
}
if req.Phone != nil {
c.Phone = *req.Phone
}
if req.Company != nil {
c.Company = *req.Company
}
if req.Address != nil {
c.Address = *req.Address
}
if req.Birthday != nil {
c.Birthday = *req.Birthday
}
c.UpdatedAt = time.Now()

_, err = s.DB.Exec(ctx,
`UPDATE contacts SET name = $3, email = $4, notes = $5, phone = $6, company = $7, address = $8, birthday = $9, updated_at = $10
 WHERE id = $1 AND user_id = $2`,
contactID, userID, c.Name, c.Email, c.Notes, c.Phone, c.Company, c.Address, c.Birthday, c.UpdatedAt,
)
return c, err
}

func (s *Store) DeleteContact(ctx context.Context, userID, contactID string) error {
tag, err := s.DB.Exec(ctx,
`DELETE FROM contacts WHERE id = $1 AND user_id = $2`,
contactID, userID,
)
if err != nil {
return err
}
if tag.RowsAffected() == 0 {
return ErrNotFound
}
return nil
}

func (s *Store) SearchContacts(ctx context.Context, userID, query string) ([]model.Contact, error) {
pattern := "%" + query + "%"
rows, err := s.DB.Query(ctx,
`SELECT id, email, name, notes, phone, company, address, birthday, created_at, updated_at
 FROM contacts WHERE user_id = $1
   AND (name ILIKE $2 OR email ILIKE $2)
 ORDER BY name ASC LIMIT 50`,
userID, pattern,
)
if err != nil {
return nil, err
}
defer rows.Close()

var contacts []model.Contact
for rows.Next() {
var c model.Contact
if err := rows.Scan(&c.ID, &c.Email, &c.Name, &c.Notes, &c.Phone, &c.Company, &c.Address, &c.Birthday, &c.CreatedAt, &c.UpdatedAt); err != nil {
return nil, err
}
contacts = append(contacts, c)
}
if contacts == nil {
contacts = []model.Contact{}
}
return contacts, rows.Err()
}
