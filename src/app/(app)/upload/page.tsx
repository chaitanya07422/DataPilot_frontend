import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  return (
    <PageShell title="Upload">
      <PlaceholderPanel
        title="File Upload"
        description="Drag and drop files or browse to upload datasets."
      />
      <div className="mt-6">
        <Button disabled>Upload (placeholder)</Button>
      </div>
    </PageShell>
  );
}
