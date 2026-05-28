import { PageShell } from "@/components/layout/page-shell";
import { UploadForm } from "@/components/upload/upload-form";

export default function UploadPage() {
  return (
    <PageShell title="Upload">
      <UploadForm />
    </PageShell>
  );
}
