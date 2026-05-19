import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

export default function AIChatPage() {
  return (
    <PageShell title="AI Chat">
      <PlaceholderPanel
        title="Conversational Analytics"
        description="Ask questions about your datasets using natural language."
      />
    </PageShell>
  );
}
