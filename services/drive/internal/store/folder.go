package store

import (
	"context"

	"github.com/haseen-me/haseen-apps/services/drive/internal/model"
)

func (s *Store) CreateFolder(ctx context.Context, ownerID, name string, parentID *string) (*model.Folder, error) {
	f := &model.Folder{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO drive_folders (owner_id, parent_id, name)
		 VALUES ($1, $2, $3)
		 RETURNING id, owner_id, parent_id, name, created_at`,
		ownerID, parentID, name,
	).Scan(&f.ID, &f.OwnerID, &f.ParentID, &f.Name, &f.CreatedAt)
	return f, err
}

func (s *Store) GetFolder(ctx context.Context, folderID string) (*model.Folder, error) {
	f := &model.Folder{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, owner_id, parent_id, name, created_at
		 FROM drive_folders WHERE id = $1`,
		folderID,
	).Scan(&f.ID, &f.OwnerID, &f.ParentID, &f.Name, &f.CreatedAt)
	if err != nil {
		return nil, err
	}
	return f, nil
}

func (s *Store) GetSubfolders(ctx context.Context, ownerID string, parentID *string) ([]model.Folder, error) {
	var query string
	var args []interface{}
	if parentID != nil {
		query = `SELECT id, owner_id, parent_id, name, created_at
			 FROM drive_folders WHERE owner_id = $1 AND parent_id = $2 AND deleted_at IS NULL
			 ORDER BY name ASC`
		args = []interface{}{ownerID, *parentID}
	} else {
		query = `SELECT id, owner_id, parent_id, name, created_at
			 FROM drive_folders WHERE owner_id = $1 AND parent_id IS NULL AND deleted_at IS NULL
			 ORDER BY name ASC`
		args = []interface{}{ownerID}
	}
	rows, err := s.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var folders []model.Folder
	for rows.Next() {
		var f model.Folder
		if err := rows.Scan(&f.ID, &f.OwnerID, &f.ParentID, &f.Name, &f.CreatedAt); err != nil {
			return nil, err
		}
		folders = append(folders, f)
	}
	if folders == nil {
		folders = []model.Folder{}
	}
	return folders, rows.Err()
}

func (s *Store) DeleteFolder(ctx context.Context, folderID string) error {
	tag, err := s.DB.Exec(ctx, `DELETE FROM drive_folders WHERE id = $1`, folderID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) RenameFolder(ctx context.Context, folderID, name string) (*model.Folder, error) {
	f := &model.Folder{}
	err := s.DB.QueryRow(ctx,
		`UPDATE drive_folders SET name = $2 WHERE id = $1
		 RETURNING id, owner_id, parent_id, name, created_at`,
		folderID, name,
	).Scan(&f.ID, &f.OwnerID, &f.ParentID, &f.Name, &f.CreatedAt)
	return f, err
}

// GetFolderPath returns the path from root to the given folder.
func (s *Store) GetFolderPath(ctx context.Context, folderID string) ([]model.Folder, error) {
	var path []model.Folder
	current := folderID
	for {
		f, err := s.GetFolder(ctx, current)
		if err != nil {
			break
		}
		path = append([]model.Folder{*f}, path...)
		if f.ParentID == nil {
			break
		}
		current = *f.ParentID
	}
	return path, nil
}
