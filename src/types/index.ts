export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ProcessingStatus = "pending" | "processing" | "indexed" | "failed";

export type UploadedFile = {
  id: string;
  filename: string;
  mimeType: string | null;
  size: number | null;
  storagePath: string | null;
  processingStatus: ProcessingStatus;
  errorMessage: string | null;
  chunkCount: number | null;
  rowCount: number | null;
  cleanedRowCount: number | null;
  sheetName: string | null;
  datasetId: string;
  createdAt: string;
  updatedAt: string;
};

export type Dataset = {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { uploadedFiles: number };
};

export type DatasetWithFiles = Dataset & {
  uploadedFiles: UploadedFile[];
};

export type CleaningOptions = {
  trimCells: boolean;
  normalizeHeaders: boolean;
  removeEmptyRows: boolean;
  removeDuplicateRows: boolean;
  duplicateKeyColumns?: string[];
};

export type CleaningReport = {
  id: string;
  fileId: string;
  sheetId: string | null;
  originalRowCount: number;
  cleanedRowCount: number;
  duplicatesRemoved: number;
  emptyRowsRemoved: number;
  cellsTrimmed: number;
  cleaningConfig: CleaningOptions;
  appliedAt: string;
};

export type PaginatedRows = {
  rows: Record<string, unknown>[];
  total: number;
  offset: number;
  limit: number;
};
