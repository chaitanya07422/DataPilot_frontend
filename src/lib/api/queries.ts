import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

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
