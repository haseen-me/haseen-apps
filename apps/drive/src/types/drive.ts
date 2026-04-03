export interface DriveFile {
  id: string;
  folderId: string | null;
  name: string;
  mimeType: string;
  size: number;
  encryptedKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  parentId: string | null;
  name: string;
  createdAt: string;
}

export interface FolderContents {
  folder: Folder | null;
  folders: Folder[];
  files: DriveFile[];
  path: Folder[];
}

export interface Share {
  id: string;
  fileId?: string;
  folderId?: string;
  sharedWith: string;
  permission: 'read' | 'write';
  createdAt: string;
}

export type ViewMode = 'grid' | 'list';

export type SortField = 'name' | 'updatedAt' | 'size';
export type SortDir = 'asc' | 'desc';

export interface FileIcon {
  icon: string;
  color: string;
}

export function getFileIcon(mimeType: string): FileIcon {
  if (mimeType.startsWith('image/')) return { icon: 'image', color: '#e54666' };
  if (mimeType.startsWith('video/')) return { icon: 'video', color: '#8e4ec6' };
  if (mimeType.startsWith('audio/')) return { icon: 'music', color: '#e5484d' };
  if (mimeType === 'application/pdf') return { icon: 'file-text', color: '#e5484d' };
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return { icon: 'table', color: '#30a46c' };
  if (mimeType.includes('document') || mimeType.includes('word')) return { icon: 'file-text', color: '#3e63dd' };
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return { icon: 'presentation', color: '#f76b15' };
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('compressed')) return { icon: 'archive', color: '#978365' };
  if (mimeType.startsWith('text/')) return { icon: 'file-code', color: '#6e56cf' };
  return { icon: 'file', color: '#5a6275' };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(1) + ' GB';
}
