import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

export default function ReportsPage() {
  return (
    <PageShell title="Reports">
      <PlaceholderPanel
        title="Reports & Exports"
        description="Generate and download analytical reports."
      />
    </PageShell>
  );
}
