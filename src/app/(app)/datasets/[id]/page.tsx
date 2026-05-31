import { Suspense } from "react";
import { DatasetViewer } from "@/components/datasets/dataset-viewer";

type DatasetViewerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DatasetViewerPage({ params }: DatasetViewerPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<p className="p-6 text-sm">Loading dataset…</p>}>
      <DatasetViewer datasetId={id} />
    </Suspense>
  );
}
