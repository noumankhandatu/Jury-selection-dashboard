/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";

export const SessionSummary = ({ session }: { session: any }) => {
  if (!session) return null;
  return (
    <Card className="bg-white/80 backdrop-blur-md shadow rounded-xl">
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-2">
          <div className="text-lg font-semibold">{session.name}</div>
          <div className="text-sm text-muted-foreground">
            Case: {session.case?.caseNumber} • {session.case?.caseName} • {session.case?.caseType}
          </div>
          <div className="text-sm text-muted-foreground">Status: {session.status}</div>
          <div className="text-xs text-muted-foreground">
            Start: {session.startTime ? new Date(session.startTime).toLocaleString() : "-"} • End: {session.endTime ? new Date(session.endTime).toLocaleString() : "-"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


