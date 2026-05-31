"use client";

import { useMemo } from "react";
import "@/lib/ag-grid-setup";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { themeQuartz } from "ag-grid-community";
import { useFileHeaders, useFileRows } from "@/lib/api/queries";

type DatasetGridProps = {
  datasetId: string;
  fileId: string;
};

export function DatasetGrid({ datasetId, fileId }: DatasetGridProps) {
  const { data: headers = [], isLoading: headersLoading } = useFileHeaders(datasetId, fileId);
  const { data: page, isLoading: rowsLoading } = useFileRows(datasetId, fileId, 0, 500);

  const columnDefs = useMemo<ColDef[]>(
    () =>
      headers.map((field) => ({
        field,
        headerName: field,
        flex: 1,
        minWidth: 120,
      })),
    [headers],
  );

  const rowData = page?.rows ?? [];
  const loading = headersLoading || rowsLoading;

  if (loading) {
    return <p className="text-muted-foreground text-sm">Loading data…</p>;
  }

  if (!headers.length) {
    return (
      <p className="text-muted-foreground text-sm">
        No cleaned tabular data yet. Upload a CSV or Excel file and wait for processing.
      </p>
    );
  }

  return (
    <div className="h-[480px] w-full">
      <AgGridReact
        theme={themeQuartz}
        columnDefs={columnDefs}
        rowData={rowData}
        defaultColDef={{ sortable: true, filter: true, resizable: true }}
      />
      {page && page.total > rowData.length && (
        <p className="text-muted-foreground mt-2 text-xs">
          Showing {rowData.length} of {page.total} rows
        </p>
      )}
    </div>
  );
}
