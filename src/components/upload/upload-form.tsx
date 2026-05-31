"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCreateDataset,
  useDatasets,
  useUploadFile,
  useUploads,
} from "@/lib/api/queries";
import type { ProcessingStatus } from "@/types";

const ACCEPT = ".pdf,.csv,.xls,.xlsx,.txt,.md";

function statusLabel(status: ProcessingStatus): string {
  switch (status) {
    case "pending":
      return "Queued";
    case "processing":
      return "Processing";
    case "indexed":
      return "Indexed";
    case "failed":
      return "Failed";
  }
}

export function UploadForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [datasetId, setDatasetId] = useState("");
  const [newDatasetName, setNewDatasetName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastUploadedFileId, setLastUploadedFileId] = useState<string | null>(null);

  const {
    data: datasets,
    isLoading: datasetsLoading,
    isError: datasetsError,
  } = useDatasets();
  const { data: uploads, isError: uploadsError } = useUploads(datasetId || undefined);
  const uploadMutation = useUploadFile();
  const createDatasetMutation = useCreateDataset();

  const selectedDataset = datasets?.find((d) => d.id === datasetId);

  // Auto-select first dataset when list loads (e.g. Default Dataset from seed)
  useEffect(() => {
    if (!datasetId && datasets?.length) {
      setDatasetId(datasets[0]!.id);
    }
  }, [datasets, datasetId]);

  const handleDatasetChange = (id: string) => {
    setDatasetId(id);
    setError(null);
    setSuccess(null);
  };

  const handleCreateDataset = async () => {
    if (!newDatasetName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const dataset = await createDatasetMutation.mutateAsync({
        name: newDatasetName.trim(),
      });
      setDatasetId(dataset.id);
      setNewDatasetName("");
      setSuccess(`Dataset "${dataset.name}" created and selected.`);
    } catch (err) {
      let message = "Failed to create dataset";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { error?: string } | undefined;
        message = data?.error ?? err.message;
      }
      setError(message);
    }
  };

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;

      if (!datasetId) {
        setError("Select or create a dataset first");
        setSuccess(null);
        return;
      }

      setError(null);
      setSuccess(null);

      for (const file of Array.from(files)) {
        try {
          const uploaded = await uploadMutation.mutateAsync({ datasetId, file });
          setLastUploadedFileId(uploaded.id);
          const isTabular = /\.(csv|xls|xlsx)$/i.test(file.name);
          setSuccess(
            isTabular
              ? `Uploaded ${file.name}. Cleaning and indexing in background…`
              : `Uploaded ${file.name}. Processing in background…`,
          );
        } catch (err) {
          let message = "Unknown error";
          if (axios.isAxiosError(err)) {
            const data = err.response?.data as { error?: string } | undefined;
            message = data?.error ?? err.message;
          } else if (err instanceof Error) {
            message = err.message;
          }
          setError(`Failed to upload ${file.name}: ${message}`);
          return;
        }
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [datasetId, uploadMutation],
  );

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (!datasetId) {
      setError("Select or create a dataset first");
      return;
    }
    void handleUpload(event.dataTransfer.files);
  };

  const onUploadAreaClick = () => {
    if (!datasetId) {
      setError("Pick a dataset from the dropdown above, or click Create.");
      return;
    }
    inputRef.current?.click();
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  const canUpload = Boolean(datasetId) && !datasetsLoading;

  return (
    <div className="space-y-6">
      {datasetsError && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Cannot reach API at <strong>{apiUrl}</strong>. Start the backend with{" "}
          <code className="text-xs">npm run dev</code> in datapilot-backend (port 3001).
        </p>
      )}

      {uploadsError && datasetId && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Could not load file list. Restart the API after running{" "}
          <code className="text-xs">npx prisma migrate deploy</code>.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dataset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="text-muted-foreground text-xs font-medium">
            Active dataset
          </label>
          <select
            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
            value={datasetId}
            onChange={(e) => handleDatasetChange(e.target.value)}
            disabled={datasetsLoading || !datasets?.length}
          >
            <option value="">
              {datasetsLoading ? "Loading…" : "Select a dataset"}
            </option>
            {datasets?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d._count ? ` (${d._count.uploadedFiles} files)` : ""}
              </option>
            ))}
          </select>

          {selectedDataset && (
            <p className="text-sm text-green-600">
              Ready to upload to: <strong>{selectedDataset.name}</strong>
            </p>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New dataset name"
              className="border-input bg-background flex-1 rounded-md border px-3 py-2 text-sm"
              value={newDatasetName}
              onChange={(e) => setNewDatasetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreateDataset();
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCreateDataset()}
              disabled={createDatasetMutation.isPending || !newDatasetName.trim()}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-muted-foreground/25 flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center ${
              canUpload ? "cursor-pointer hover:bg-accent/30" : "cursor-not-allowed opacity-70"
            }`}
            onDragOver={(e) => canUpload && e.preventDefault()}
            onDrop={onDrop}
            onClick={onUploadAreaClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onUploadAreaClick();
            }}
          >
            <Upload className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-sm font-medium">
              {canUpload
                ? "Drag and drop or click to browse"
                : "Waiting for a dataset…"}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              PDF, CSV, Excel (.xls, .xlsx), TXT, or Markdown
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              disabled={!canUpload}
              onChange={(e) => void handleUpload(e.target.files)}
            />
          </div>
          {uploadMutation.isPending && (
            <p className="text-muted-foreground mt-3 text-sm">Uploading…</p>
          )}
          {success && (
            <div className="mt-3 space-y-1">
              <p className="text-sm text-green-600">{success}</p>
              {lastUploadedFileId && datasetId && (
                <Link
                  href={`/datasets/${datasetId}?file=${lastUploadedFileId}`}
                  className="text-primary text-sm underline"
                >
                  View cleaned data →
                </Link>
              )}
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {datasetId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Files in dataset</CardTitle>
          </CardHeader>
          <CardContent>
            {!uploads?.length ? (
              <p className="text-muted-foreground text-sm">No files uploaded yet.</p>
            ) : (
              <ul className="divide-y text-sm">
                {uploads.map((file) => {
                  const isTabular = /\.(csv|xls|xlsx)$/i.test(file.filename);
                  return (
                    <li key={file.id} className="flex items-center justify-between gap-3 py-3">
                      <span className="truncate font-medium">{file.filename}</span>
                      <div className="flex shrink-0 items-center gap-3">
                        {isTabular && file.processingStatus === "indexed" && (
                          <Link
                            href={`/datasets/${datasetId}?file=${file.id}`}
                            className="text-primary text-xs underline"
                          >
                            Re-clean
                          </Link>
                        )}
                        <span
                          className={
                            file.processingStatus === "failed"
                              ? "text-red-600"
                              : file.processingStatus === "indexed"
                                ? "text-green-600"
                                : "text-muted-foreground"
                          }
                        >
                          {statusLabel(file.processingStatus)}
                          {file.cleanedRowCount != null && isTabular
                            ? ` · ${file.cleanedRowCount} rows`
                            : ""}
                          {file.chunkCount != null && file.processingStatus === "indexed"
                            ? ` · ${file.chunkCount} chunks`
                            : ""}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
