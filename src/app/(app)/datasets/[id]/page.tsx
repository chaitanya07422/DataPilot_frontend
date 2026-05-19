import { PageShell } from "@/components/layout/page-shell";
import { DatasetGrid } from "@/components/datasets/dataset-grid";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

type DatasetViewerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DatasetViewerPage({ params }: DatasetViewerPageProps) {
  const { id } = await params;

  return (
    <PageShell title={`Dataset: ${id}`}>
      <PlaceholderPanel
        title="Dataset Viewer"
        description="Explore tabular data with AG Grid. Sample rows shown below."
      />
      <div className="mt-6">
        <DatasetGrid />
      </div>
    </PageShell>
  );
}
