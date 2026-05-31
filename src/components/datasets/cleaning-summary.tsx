import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CleaningReport } from "@/types";

type CleaningSummaryProps = {
  report: CleaningReport;
};

export function CleaningSummary({ report }: CleaningSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cleaning summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>
          Original rows: <strong>{report.originalRowCount}</strong> → Cleaned:{" "}
          <strong>{report.cleanedRowCount}</strong>
        </p>
        <p className="text-muted-foreground">
          Removed {report.duplicatesRemoved} duplicate(s), {report.emptyRowsRemoved} empty
          row(s), trimmed {report.cellsTrimmed} cell(s)
        </p>
        <p className="text-muted-foreground text-xs">
          Last applied: {new Date(report.appliedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
