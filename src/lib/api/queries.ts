import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { createDataset, fetchDataset, fetchDatasets } from "./datasets";
import {
  fetchCleaningReport,
  fetchFileHeaders,
  fetchFileRows,
  reCleanFile,
} from "./file-data";
import { fetchUpload, fetchUploads, uploadFile } from "./uploads";
import type { CleaningOptions } from "@/types";

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data } = await apiClient.get("/health");
      return data;
    },
    enabled: false,
  });
}

export function useDatasets() {
  return useQuery({
    queryKey: ["datasets"],
    queryFn: fetchDatasets,
  });
}

export function useDataset(id: string) {
  return useQuery({
    queryKey: ["datasets", id],
    queryFn: () => fetchDataset(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const files = query.state.data?.uploadedFiles;
      if (!files?.length) return false;
      const busy = files.some(
        (f) => f.processingStatus === "pending" || f.processingStatus === "processing",
      );
      return busy ? 2000 : false;
    },
  });
}

export function useCreateDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDataset,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
}

export function useUploads(datasetId?: string) {
  return useQuery({
    queryKey: ["uploads", datasetId],
    queryFn: () => fetchUploads(datasetId),
    enabled: Boolean(datasetId),
    refetchInterval: (query) => {
      const files = query.state.data;
      if (!files?.length) return false;
      const hasPending = files.some(
        (f) => f.processingStatus === "pending" || f.processingStatus === "processing",
      );
      return hasPending ? 2000 : false;
    },
  });
}

export function useUpload(id: string, poll = false) {
  return useQuery({
    queryKey: ["uploads", "detail", id],
    queryFn: () => fetchUpload(id),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      if (!poll) return false;
      const status = query.state.data?.processingStatus;
      return status === "pending" || status === "processing" ? 2000 : false;
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ datasetId, file }: { datasetId: string; file: File }) =>
      uploadFile(datasetId, file),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["uploads", variables.datasetId] });
      void queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
}

export function useFileHeaders(datasetId: string, fileId: string) {
  return useQuery({
    queryKey: ["file-headers", datasetId, fileId],
    queryFn: () => fetchFileHeaders(datasetId, fileId),
    enabled: Boolean(datasetId && fileId),
  });
}

export function useFileRows(datasetId: string, fileId: string, offset = 0, limit = 100) {
  return useQuery({
    queryKey: ["file-rows", datasetId, fileId, offset, limit],
    queryFn: () => fetchFileRows(datasetId, fileId, offset, limit),
    enabled: Boolean(datasetId && fileId),
    refetchInterval: (query) => {
      const total = query.state.data?.total;
      return total === 0 ? 2000 : false;
    },
  });
}

export function useCleaningReport(
  datasetId: string,
  fileId: string,
  pollWhileProcessing = false,
) {
  return useQuery({
    queryKey: ["cleaning-report", datasetId, fileId],
    queryFn: () => fetchCleaningReport(datasetId, fileId),
    enabled: Boolean(datasetId && fileId),
    refetchInterval: pollWhileProcessing ? 2000 : false,
  });
}

export function useReCleanFile(datasetId: string, fileId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options: CleaningOptions) => reCleanFile(datasetId, fileId, options),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["file-rows", datasetId, fileId] });
      void queryClient.invalidateQueries({ queryKey: ["cleaning-report", datasetId, fileId] });
      void queryClient.invalidateQueries({ queryKey: ["datasets", datasetId] });
    },
  });
}
