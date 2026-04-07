package store

import (
	"context"

	"github.com/haseen-me/haseen-apps/services/contacts/internal/model"
	"github.com/jackc/pgx/v5"
)

func (s *Store) CreateGroup(ctx context.Context, userID string, req *model.CreateGroupRequest) (*model.Group, error) {
	g := &model.Group{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO contact_groups (user_id, name, color) VALUES ($1, $2, $3)
 RETURNING id, name, color, created_at`,
		userID, req.Name, req.Color,
	).Scan(&g.ID, &g.Name, &g.Color, &g.CreatedAt)
	return g, err
}

func (s *Store) ListGroups(ctx context.Context, userID string) ([]model.Group, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, name, color, created_at FROM contact_groups WHERE user_id = $1 ORDER BY name ASC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []model.Group
	for rows.Next() {
		var g model.Group
		if err := rows.Scan(&g.ID, &g.Name, &g.Color, &g.CreatedAt); err != nil {
			return nil, err
		}
		groups = append(groups, g)
	}
	if groups == nil {
		groups = []model.Group{}
	}
	return groups, rows.Err()
}

func (s *Store) UpdateGroup(ctx context.Context, userID, groupID string, req *model.UpdateGroupRequest) (*model.Group, error) {
	var g model.Group
	err := s.DB.QueryRow(ctx,
		`SELECT id, name, color, created_at FROM contact_groups WHERE id = $1 AND user_id = $2`,
		groupID, userID,
	).Scan(&g.ID, &g.Name, &g.Color, &g.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if req.Name != nil {
		g.Name = *req.Name
	}
	if req.Color != nil {
		g.Color = *req.Color
	}
	_, err = s.DB.Exec(ctx,
		`UPDATE contact_groups SET name = $3, color = $4 WHERE id = $1 AND user_id = $2`,
		groupID, userID, g.Name, g.Color,
	)
	return &g, err
}

func (s *Store) DeleteGroup(ctx context.Context, userID, groupID string) error {
	tag, err := s.DB.Exec(ctx,
		`DELETE FROM contact_groups WHERE id = $1 AND user_id = $2`,
		groupID, userID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) AddContactToGroup(ctx context.Context, userID, groupID, contactID string) error {
	_, err := s.DB.Exec(ctx,
		`INSERT INTO contact_group_members (group_id, contact_id)
 SELECT $1, $2 WHERE EXISTS (SELECT 1 FROM contact_groups WHERE id = $1 AND user_id = $3)
 ON CONFLICT DO NOTHING`,
		groupID, contactID, userID,
	)
	return err
}

func (s *Store) RemoveContactFromGroup(ctx context.Context, userID, groupID, contactID string) error {
	_, err := s.DB.Exec(ctx,
		`DELETE FROM contact_group_members WHERE group_id = $1 AND contact_id = $2
 AND EXISTS (SELECT 1 FROM contact_groups WHERE id = $1 AND user_id = $3)`,
		groupID, contactID, userID,
	)
	return err
}

func (s *Store) GetGroupMembers(ctx context.Context, userID, groupID string) ([]string, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT m.contact_id FROM contact_group_members m
 JOIN contact_groups g ON g.id = m.group_id
 WHERE m.group_id = $1 AND g.user_id = $2`,
		groupID, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	if ids == nil {
		ids = []string{}
	}
	return ids, rows.Err()
}
