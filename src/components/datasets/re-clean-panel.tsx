"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCleaningReport, useReCleanFile } from "@/lib/api/queries";
import type { CleaningOptions, ProcessingStatus } from "@/types";

const DEFAULT_OPTIONS: CleaningOptions = {
  trimCells: true,
  normalizeHeaders: true,
  removeEmptyRows: true,
  removeDuplicateRows: true,
};

const OPTION_LABELS: { key: keyof CleaningOptions; label: string }[] = [
  { key: "trimCells", label: "Trim whitespace in cells" },
  { key: "normalizeHeaders", label: "Normalize column headers" },
  { key: "removeEmptyRows", label: "Remove empty rows" },
  { key: "removeDuplicateRows", label: "Remove duplicate rows" },
];

type ReCleanPanelProps = {
  datasetId: string;
  fileId: string;
  processingStatus: ProcessingStatus;
};

export function ReCleanPanel({ datasetId, fileId, processingStatus }: ReCleanPanelProps) {
  const [cleanOptions, setCleanOptions] = useState<CleaningOptions>(DEFAULT_OPTIONS);
  const [message, setMessage] = useState<string | null>(null);

  const { data: report } = useCleaningReport(
    datasetId,
    fileId,
    processingStatus === "pending" || processingStatus === "processing",
  );
  const reCleanMutation = useReCleanFile(datasetId, fileId);

  useEffect(() => {
    if (report?.cleaningConfig) {
      setCleanOptions({
        trimCells: report.cleaningConfig.trimCells ?? true,
        normalizeHeaders: report.cleaningConfig.normalizeHeaders ?? true,
        removeEmptyRows: report.cleaningConfig.removeEmptyRows ?? true,
        removeDuplicateRows: report.cleaningConfig.removeDuplicateRows ?? true,
        duplicateKeyColumns: report.cleaningConfig.duplicateKeyColumns,
      });
    }
  }, [report]);

  const isBusy =
    processingStatus === "pending" || processingStatus === "processing" || reCleanMutation.isPending;

  const handleApply = () => {
    setMessage(null);
    reCleanMutation.mutate(cleanOptions, {
      onSuccess: () => {
        setMessage("Re-clean queued. Grid and summary will update when processing finishes.");
      },
      onError: () => {
        setMessage("Failed to queue re-clean. Check that the API and worker are running.");
      },
    });
  };

  const resetToDefaults = () => {
    setCleanOptions(DEFAULT_OPTIONS);
    setMessage(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Re-clean options (optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          CSV and Excel files are{" "}
          <strong className="text-foreground font-medium">auto-cleaned on upload</strong> using
          the default profile below. Change the checkboxes and click Apply only if you want to
          re-run cleaning from the original file with different rules.
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {OPTION_LABELS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="rounded border"
                checked={Boolean(cleanOptions[key])}
                disabled={isBusy}
                onChange={(e) =>
                  setCleanOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={!fileId || isBusy} onClick={handleApply}>
            {reCleanMutation.isPending
              ? "Queuing…"
              : processingStatus === "processing"
                ? "Processing…"
                : "Apply cleaning"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={resetToDefaults}
          >
            Reset to defaults
          </Button>
        </div>

        {isBusy && processingStatus !== "indexed" && (
          <p className="text-muted-foreground text-sm">Status: {processingStatus}…</p>
        )}

        {message && (
          <p
            className={
              message.startsWith("Failed")
                ? "text-sm text-red-600"
                : "text-sm text-green-600"
            }
          >
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
