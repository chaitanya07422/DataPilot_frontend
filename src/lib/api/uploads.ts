import type { ApiResponse, UploadedFile } from "@/types";
import { apiClient } from "./client";

export async function fetchUploads(datasetId?: string) {
  const { data } = await apiClient.get<ApiResponse<UploadedFile[]>>("/uploads", {
    params: datasetId ? { datasetId } : undefined,
  });
  return data.data;
}

export async function fetchUpload(id: string) {
  const { data } = await apiClient.get<ApiResponse<UploadedFile>>(`/uploads/${id}`);
  return data.data;
}

export async function uploadFile(datasetId: string, file: File) {
  const formData = new FormData();
  formData.append("datasetId", datasetId);
  formData.append("file", file);

  const { data } = await apiClient.post<ApiResponse<UploadedFile>>("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120_000,
  });
  return data.data;
}
