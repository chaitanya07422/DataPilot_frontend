import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { createDataset, fetchDataset, fetchDatasets } from "./datasets";
import { fetchUpload, fetchUploads, uploadFile } from "./uploads";

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
