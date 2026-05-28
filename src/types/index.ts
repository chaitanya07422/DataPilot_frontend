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
