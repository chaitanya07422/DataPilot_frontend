"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/page-shell";
import { CleaningSummary } from "@/components/datasets/cleaning-summary";
import { DatasetGrid } from "@/components/datasets/dataset-grid";
import { ReCleanPanel } from "@/components/datasets/re-clean-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCleaningReport, useDataset } from "@/lib/api/queries";

type DatasetViewerProps = {
  datasetId: string;
};

function isTabularFilename(filename: string): boolean {
  return /\.(csv|xls|xlsx)$/i.test(filename);
}

export function DatasetViewer({ datasetId }: DatasetViewerProps) {
  const searchParams = useSearchParams();
  const fileFromQuery = searchParams.get("file");

  const { data: dataset, isLoading } = useDataset(datasetId);
  const [selectedFileId, setSelectedFileId] = useState("");

  const tabularFiles =
    dataset?.uploadedFiles.filter((f) => isTabularFilename(f.filename)) ?? [];

  const selectedFile = tabularFiles.find((f) => f.id === selectedFileId);

  useEffect(() => {
    if (fileFromQuery && tabularFiles.some((f) => f.id === fileFromQuery)) {
      setSelectedFileId(fileFromQuery);
    } else if (!selectedFileId && tabularFiles.length > 0) {
      setSelectedFileId(tabularFiles[0]!.id);
    }
  }, [fileFromQuery, tabularFiles, selectedFileId]);

  const { data: report } = useCleaningReport(
    datasetId,
    selectedFileId,
    selectedFile?.processingStatus === "pending" ||
      selectedFile?.processingStatus === "processing",
  );

  if (isLoading) {
    return (
      <PageShell title="Dataset">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </PageShell>
    );
  }

  if (!dataset) {
    return (
      <PageShell title="Dataset">
        <p className="text-red-600 text-sm">Dataset not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell title={dataset.name}>
      <div className="space-y-6">
        {tabularFiles.length > 0 ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Uploaded file</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  className="border-input bg-background w-full max-w-md rounded-md border px-3 py-2 text-sm"
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                >
                  {tabularFiles.map((file) => (
                    <option key={file.id} value={file.id}>
                      {file.filename}
                      {file.cleanedRowCount != null ? ` (${file.cleanedRowCount} rows)` : ""}
                      {" — "}
                      {file.processingStatus}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {report && <CleaningSummary report={report} />}

            {selectedFile && (
              <ReCleanPanel
                datasetId={datasetId}
                fileId={selectedFileId}
                processingStatus={selectedFile.processingStatus}
              />
            )}

            {selectedFileId && selectedFile?.processingStatus === "indexed" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cleaned data</CardTitle>
                </CardHeader>
                <CardContent>
                  <DatasetGrid datasetId={datasetId} fileId={selectedFileId} />
                </CardContent>
              </Card>
            )}

            {selectedFile &&
              (selectedFile.processingStatus === "pending" ||
                selectedFile.processingStatus === "processing") && (
                <p className="text-muted-foreground text-sm">
                  Cleaning and indexing in progress… this page refreshes automatically.
                </p>
              )}

            {selectedFile?.processingStatus === "failed" && (
              <p className="text-sm text-red-600">
                Processing failed
                {selectedFile.errorMessage ? `: ${selectedFile.errorMessage}` : "."} Adjust
                options above and apply again, or re-upload the file.
              </p>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">
                No CSV or Excel files in this dataset yet.{" "}
                <Link href="/upload" className="text-primary underline">
                  Upload a file
                </Link>{" "}
                — it will be auto-cleaned on first processing.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
