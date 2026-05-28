import type { ApiResponse, Dataset, DatasetWithFiles } from "@/types";
import { apiClient } from "./client";

export async function fetchDatasets() {
  const { data } = await apiClient.get<ApiResponse<Dataset[]>>("/datasets");
  return data.data;
}

export async function fetchDataset(id: string) {
  const { data } = await apiClient.get<ApiResponse<DatasetWithFiles>>(`/datasets/${id}`);
  return data.data;
}

export async function createDataset(payload: { name: string; description?: string }) {
  const { data } = await apiClient.post<ApiResponse<Dataset>>("/datasets", payload);
  return data.data;
}
