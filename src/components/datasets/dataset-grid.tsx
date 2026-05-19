"use client";

import "@/lib/ag-grid-setup";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const columnDefs: ColDef[] = [
  { field: "id", headerName: "ID", flex: 1 },
  { field: "name", headerName: "Name", flex: 2 },
  { field: "status", headerName: "Status", flex: 1 },
];

const rowData = [
  { id: "sample-1", name: "Sample Dataset", status: "placeholder" },
  { id: "sample-2", name: "Demo Dataset", status: "placeholder" },
];

export function DatasetGrid() {
  return (
    <div className="ag-theme-quartz h-[480px] w-full">
      <AgGridReact columnDefs={columnDefs} rowData={rowData} />
    </div>
  );
}
