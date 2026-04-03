import type { DriveFile, Folder } from '@/types/drive';

const h = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();

export const MOCK_FOLDERS: Folder[] = [
  { id: 'f1', parentId: null, name: 'Documents', createdAt: h(720) },
  { id: 'f2', parentId: null, name: 'Photos', createdAt: h(360) },
  { id: 'f3', parentId: null, name: 'Projects', createdAt: h(168) },
  { id: 'f4', parentId: 'f1', name: 'Invoices', createdAt: h(48) },
  { id: 'f5', parentId: 'f1', name: 'Reports', createdAt: h(24) },
];

export const MOCK_FILES: DriveFile[] = [
  { id: 'd1', folderId: null, name: 'README.md', mimeType: 'text/markdown', size: 4200, createdAt: h(2), updatedAt: h(1) },
  { id: 'd2', folderId: null, name: 'presentation.pdf', mimeType: 'application/pdf', size: 2400000, createdAt: h(24), updatedAt: h(6) },
  { id: 'd3', folderId: null, name: 'budget-2025.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 84000, createdAt: h(48), updatedAt: h(12) },
  { id: 'd4', folderId: 'f2', name: 'vacation.jpg', mimeType: 'image/jpeg', size: 4800000, createdAt: h(72), updatedAt: h(72) },
  { id: 'd5', folderId: 'f2', name: 'screenshot.png', mimeType: 'image/png', size: 320000, createdAt: h(4), updatedAt: h(4) },
  { id: 'd6', folderId: 'f1', name: 'contract.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 56000, createdAt: h(168), updatedAt: h(96) },
  { id: 'd7', folderId: 'f3', name: 'app.zip', mimeType: 'application/zip', size: 15000000, createdAt: h(8), updatedAt: h(8) },
  { id: 'd8', folderId: 'f4', name: 'invoice-march.pdf', mimeType: 'application/pdf', size: 120000, createdAt: h(3), updatedAt: h(3) },
];
