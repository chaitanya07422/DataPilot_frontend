import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

export default function DashboardPage() {
  return (
    <PageShell title="Dashboard">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PlaceholderPanel
          title="Overview"
          description="High-level metrics and activity summary."
        />
        <PlaceholderPanel
          title="Recent Datasets"
          description="Recently uploaded and processed datasets."
        />
        <PlaceholderPanel title="AI Insights" description="Latest AI-generated insights." />
      </div>
    </PageShell>
  );
}
