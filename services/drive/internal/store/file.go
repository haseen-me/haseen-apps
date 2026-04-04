package store

import (
	"context"

	"github.com/haseen-me/haseen-apps/services/drive/internal/model"
)

func (s *Store) CreateFile(ctx context.Context, ownerID, name, mimeType string, size int64, folderID *string, blobPath string, encKey []byte) (*model.File, error) {
	f := &model.File{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO drive_files (owner_id, folder_id, name, mime_type, size, blob_path, encrypted_content_key)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, owner_id, folder_id, name, mime_type, size, blob_path, created_at, updated_at`,
		ownerID, folderID, name, mimeType, size, blobPath, encKey,
	).Scan(&f.ID, &f.OwnerID, &f.FolderID, &f.Name, &f.MimeType, &f.Size, &f.BlobPath, &f.CreatedAt, &f.UpdatedAt)
	return f, err
}

func (s *Store) GetFile(ctx context.Context, ownerID, fileID string) (*model.File, error) {
	f := &model.File{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, owner_id, folder_id, name, mime_type, size, blob_path, created_at, updated_at
		 FROM drive_files WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL`,
		fileID, ownerID,
	).Scan(&f.ID, &f.OwnerID, &f.FolderID, &f.Name, &f.MimeType, &f.Size, &f.BlobPath, &f.CreatedAt, &f.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return f, nil
}

func (s *Store) GetFilesByFolder(ctx context.Context, ownerID string, folderID *string) ([]model.File, error) {
	var query string
	var args []interface{}
	if folderID != nil {
		query = `SELECT id, owner_id, folder_id, name, mime_type, size, blob_path, created_at, updated_at
			 FROM drive_files WHERE owner_id = $1 AND folder_id = $2 AND deleted_at IS NULL
			 ORDER BY name ASC`
		args = []interface{}{ownerID, *folderID}
	} else {
		query = `SELECT id, owner_id, folder_id, name, mime_type, size, blob_path, created_at, updated_at
			 FROM drive_files WHERE owner_id = $1 AND folder_id IS NULL AND deleted_at IS NULL
			 ORDER BY name ASC`
		args = []interface{}{ownerID}
	}
	rows, err := s.DB.Query(ctx, query, args...)
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

func (s *Store) GetAllFiles(ctx context.Context, ownerID string) ([]model.File, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, owner_id, folder_id, name, mime_type, size, blob_path, created_at, updated_at
		 FROM drive_files WHERE owner_id = $1 AND deleted_at IS NULL
		 ORDER BY updated_at DESC LIMIT 200`,
		ownerID,
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

func (s *Store) UpdateFile(ctx context.Context, ownerID, fileID string, name *string, folderID *string) (*model.File, error) {
	f := &model.File{}
	err := s.DB.QueryRow(ctx,
		`UPDATE drive_files SET
		   name = COALESCE($2, name),
		   folder_id = COALESCE($3, folder_id),
		   updated_at = NOW()
		 WHERE id = $1 AND owner_id = $4
		 RETURNING id, owner_id, folder_id, name, mime_type, size, blob_path, created_at, updated_at`,
		fileID, name, folderID, ownerID,
	).Scan(&f.ID, &f.OwnerID, &f.FolderID, &f.Name, &f.MimeType, &f.Size, &f.BlobPath, &f.CreatedAt, &f.UpdatedAt)
	return f, err
}

func (s *Store) MoveFile(ctx context.Context, ownerID, fileID string, folderID *string) (*model.File, error) {
	f := &model.File{}
	err := s.DB.QueryRow(ctx,
		`UPDATE drive_files SET folder_id = $2, updated_at = NOW()
		 WHERE id = $1 AND owner_id = $3
		 RETURNING id, owner_id, folder_id, name, mime_type, size, blob_path, created_at, updated_at`,
		fileID, folderID, ownerID,
	).Scan(&f.ID, &f.OwnerID, &f.FolderID, &f.Name, &f.MimeType, &f.Size, &f.BlobPath, &f.CreatedAt, &f.UpdatedAt)
	return f, err
}

func (s *Store) DeleteFile(ctx context.Context, ownerID, fileID string) (string, error) {
	var blobPath string
	err := s.DB.QueryRow(ctx,
		`UPDATE drive_files SET deleted_at = NOW() WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL RETURNING blob_path`,
		fileID, ownerID,
	).Scan(&blobPath)
	if err != nil {
		return "", err
	}
	return blobPath, nil
}

func (s *Store) SearchFiles(ctx context.Context, ownerID, query string) ([]model.File, error) {
	pattern := "%" + query + "%"
	rows, err := s.DB.Query(ctx,
		`SELECT id, owner_id, folder_id, name, mime_type, size, blob_path, created_at, updated_at
		 FROM drive_files WHERE owner_id = $1 AND name ILIKE $2 AND deleted_at IS NULL
		 ORDER BY updated_at DESC LIMIT 50`,
		ownerID, pattern,
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

func (s *Store) SearchFolders(ctx context.Context, ownerID, query string) ([]model.Folder, error) {
	pattern := "%" + query + "%"
	rows, err := s.DB.Query(ctx,
		`SELECT id, owner_id, parent_id, name, created_at
		 FROM drive_folders WHERE owner_id = $1 AND name ILIKE $2 AND deleted_at IS NULL
		 ORDER BY name ASC LIMIT 50`,
		ownerID, pattern,
	)
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

func (s *Store) GetUserByEmail(ctx context.Context, email string) (string, error) {
	var uid string
	err := s.DB.QueryRow(ctx, `SELECT id FROM users WHERE email = $1`, email).Scan(&uid)
	return uid, err
}

func (s *Store) ListTrash(ctx context.Context, ownerID string) ([]model.File, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, owner_id, folder_id, name, mime_type, size, blob_path, created_at, updated_at, deleted_at
 FROM drive_files WHERE owner_id = $1 AND deleted_at IS NOT NULL
 ORDER BY deleted_at DESC LIMIT 200`,
		ownerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var files []model.File
	for rows.Next() {
		var f model.File
		if err := rows.Scan(&f.ID, &f.OwnerID, &f.FolderID, &f.Name, &f.MimeType, &f.Size, &f.BlobPath, &f.CreatedAt, &f.UpdatedAt, &f.DeletedAt); err != nil {
			return nil, err
		}
		files = append(files, f)
	}
	if files == nil {
		files = []model.File{}
	}
	return files, rows.Err()
}

func (s *Store) RestoreFile(ctx context.Context, ownerID, fileID string) (*model.File, error) {
	f := &model.File{}
	err := s.DB.QueryRow(ctx,
		`UPDATE drive_files SET deleted_at = NULL, updated_at = NOW()
 WHERE id = $1 AND owner_id = $2 AND deleted_at IS NOT NULL
 RETURNING id, owner_id, folder_id, name, mime_type, size, blob_path, created_at, updated_at`,
		fileID, ownerID,
	).Scan(&f.ID, &f.OwnerID, &f.FolderID, &f.Name, &f.MimeType, &f.Size, &f.BlobPath, &f.CreatedAt, &f.UpdatedAt)
	return f, err
}

func (s *Store) EmptyTrash(ctx context.Context, ownerID string) ([]string, error) {
	rows, err := s.DB.Query(ctx,
		`DELETE FROM drive_files WHERE owner_id = $1 AND deleted_at IS NOT NULL RETURNING blob_path`,
		ownerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var paths []string
	for rows.Next() {
		var p string
		if err := rows.Scan(&p); err != nil {
			return nil, err
		}
		paths = append(paths, p)
	}
	return paths, rows.Err()
}
