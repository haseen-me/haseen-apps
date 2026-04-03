package model

import "time"

// ---------- File ----------

type File struct {
	ID        string    `json:"id"`
	OwnerID   string    `json:"-"`
	FolderID  *string   `json:"folderId"`
	Name      string    `json:"name"`
	MimeType  string    `json:"mimeType"`
	Size      int64     `json:"size"`
	BlobPath  string    `json:"-"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// ---------- Folder ----------

type Folder struct {
	ID        string    `json:"id"`
	OwnerID   string    `json:"-"`
	ParentID  *string   `json:"parentId"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
}

// ---------- Share ----------

type Share struct {
	ID         string    `json:"id"`
	FileID     *string   `json:"fileId,omitempty"`
	FolderID   *string   `json:"folderId,omitempty"`
	SharedWith string    `json:"sharedWith"`
	Permission string    `json:"permission"`
	CreatedAt  time.Time `json:"createdAt"`
}

// ---------- FolderContents (API response) ----------

type FolderContents struct {
	Folder  *Folder  `json:"folder"`
	Folders []Folder `json:"folders"`
	Files   []File   `json:"files"`
	Path    []Folder `json:"path"`
}

// ---------- API Requests ----------

type CreateFolderRequest struct {
	Name     string  `json:"name"`
	ParentID *string `json:"parentId"`
}

type UploadFileMeta struct {
	Name     string  `json:"name"`
	FolderID *string `json:"folderId"`
}

type UpdateFileRequest struct {
	Name     *string `json:"name,omitempty"`
	FolderID *string `json:"folderId,omitempty"`
}

type MoveRequest struct {
	FolderID *string `json:"folderId"`
}

type ShareRequest struct {
	Email        string `json:"email"`
	Permission   string `json:"permission"`
	EncryptedKey string `json:"encryptedKey"`
}

type SearchRequest struct {
	Query string `json:"query"`
}

// ---------- API Responses ----------

type OkResponse struct {
	OK bool `json:"ok"`
}

type FileListResponse struct {
	Files []File `json:"files"`
	Total int    `json:"total"`
}

type SearchResponse struct {
	Files   []File   `json:"files"`
	Folders []Folder `json:"folders"`
}
