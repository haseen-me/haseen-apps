package store

import (
	"context"

	"github.com/haseen-me/haseen-apps/services/drive/internal/model"
)

func (s *Store) CreateShare(ctx context.Context, fileID, folderID *string, sharedWith string, encKey []byte, perm string) (*model.Share, error) {
	sh := &model.Share{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO drive_shares (file_id, folder_id, shared_with, encrypted_key, permission)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, file_id, folder_id, shared_with, permission, created_at`,
		fileID, folderID, sharedWith, encKey, perm,
	).Scan(&sh.ID, &sh.FileID, &sh.FolderID, &sh.SharedWith, &sh.Permission, &sh.CreatedAt)
	return sh, err
}

func (s *Store) GetSharesForFile(ctx context.Context, fileID string) ([]model.Share, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, file_id, folder_id, shared_with, permission, created_at
		 FROM drive_shares WHERE file_id = $1`,
		fileID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var shares []model.Share
	for rows.Next() {
		var sh model.Share
		if err := rows.Scan(&sh.ID, &sh.FileID, &sh.FolderID, &sh.SharedWith, &sh.Permission, &sh.CreatedAt); err != nil {
			return nil, err
		}
		shares = append(shares, sh)
	}
	if shares == nil {
		shares = []model.Share{}
	}
	return shares, rows.Err()
}

func (s *Store) GetSharedWithUser(ctx context.Context, userID string) ([]model.File, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT f.id, f.owner_id, f.folder_id, f.name, f.mime_type, f.size, f.blob_path, f.created_at, f.updated_at
		 FROM drive_shares s
		 JOIN drive_files f ON f.id = s.file_id
		 WHERE s.shared_with = $1
		 ORDER BY f.updated_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var files []model.File
	for rows.Next() {
		var f model.File
		if err := rows.Scan(&f.ID, &f.OwnerID, &f.FolderID, &f.Name, &f.MimeType, &f.Size, &f.BlobPath, &f.CreatedAt, &f.UpdatedAt); err != nil {
			return nil, err
		}
		files = append(files, f)
	}
	if files == nil {
		files = []model.File{}
	}
	return files, rows.Err()
}

func (s *Store) DeleteShare(ctx context.Context, shareID string) error {
	tag, err := s.DB.Exec(ctx, `DELETE FROM drive_shares WHERE id = $1`, shareID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
