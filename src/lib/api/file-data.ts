import type { ApiResponse, CleaningOptions, CleaningReport, PaginatedRows } from "@/types";
import { apiClient } from "./client";

export async function fetchFileHeaders(datasetId: string, fileId: string) {
  const { data } = await apiClient.get<ApiResponse<{ headers: string[] }>>(
    `/datasets/${datasetId}/files/${fileId}/headers`,
  );
  return data.data.headers;
}

export async function fetchFileRows(
  datasetId: string,
  fileId: string,
  offset = 0,
  limit = 100,
) {
  const { data } = await apiClient.get<ApiResponse<PaginatedRows>>(
    `/datasets/${datasetId}/files/${fileId}/rows`,
    { params: { offset, limit } },
  );
  return data.data;
}

export async function fetchCleaningReport(datasetId: string, fileId: string) {
  const { data } = await apiClient.get<ApiResponse<CleaningReport | null>>(
    `/datasets/${datasetId}/files/${fileId}/cleaning-report`,
  );
  return data.data;
}

export async function reCleanFile(
  datasetId: string,
  fileId: string,
  options: CleaningOptions,
) {
  const { data } = await apiClient.post<ApiResponse<{ status: string }>>(
    `/datasets/${datasetId}/files/${fileId}/clean`,
    options,
  );
  return data.data;
}
