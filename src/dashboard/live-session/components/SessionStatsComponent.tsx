import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SessionStatus as SessionStatusType, StatusStyling } from "@/types/sessions";
import { updateSessionStatusApi } from "@/api/api";
import { toast } from "sonner";
import { SessionStatus as ApiSessionStatus } from "@/api/types";

interface SessionStatusProps {
  sessionId: string | null;
  sessionStatus: SessionStatusType | null;
  onStatusChange: (status: SessionStatusType) => void;
}

const getStatusStyling = (status: SessionStatusType | null): StatusStyling => {
  switch (status?.status) {
    case "pending":
      return {
        dotColor: "bg-yellow-500",
        badgeVariant: "secondary" as const,
        badgeText: "Session Pending",
        badgeClass: "px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    case "active":
      return {
        dotColor: "bg-green-500",
        badgeVariant: "default" as const,
        badgeText: "Session Active",
        badgeClass: "px-3 py-1 text-sm font-medium bg-green-100 text-green-800 border-green-200",
      };
    case "completed":
      return {
        dotColor: "bg-blue-500",
        badgeVariant: "secondary" as const,
        badgeText: "Session Completed",
        badgeClass: "px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 border-blue-200",
      };
    default:
      return {
        dotColor: "bg-gray-400",
        badgeVariant: "secondary" as const,
        badgeText: "Session Inactive",
        badgeClass: "px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 border-gray-200",
      };
  }
};

const mapToApiStatus = (status: SessionStatusType['status']): ApiSessionStatus => {
  switch (status) {
    case 'active': return 'ACTIVE';
    case 'pending': return 'PENDING';
    case 'completed': return 'COMPLETED';
    default: return 'PENDING';
  }
};

const SessionStatusComponent = ({ sessionId, sessionStatus, onStatusChange }: SessionStatusProps) => {
  const handleStatusChange = async (newStatus: SessionStatusType['status']) => {
    if (!sessionId) {
      toast.error("No session selected");
      return;
    }

    try {
      const currentTime = new Date().toISOString();
      let startTime: string | undefined;
      let endTime: string | undefined;

      switch (newStatus) {
        case "active":
          startTime = currentTime;
          endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          break;
        case "completed":
          break;
      }

      await updateSessionStatusApi(
        sessionId,
        mapToApiStatus(newStatus),
        startTime,
        endTime
      );

      const updatedStatus: SessionStatusType = { status: newStatus };
      onStatusChange(updatedStatus);
      toast.success(`Session status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating session status:", error);
      toast.error("Failed to update session status");
    }
  };

  const styling = getStatusStyling(sessionStatus);

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={sessionStatus?.status || ""}
        onValueChange={handleStatusChange}
        disabled={!sessionId}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-yellow-500" />
              Pending
            </span>
          </SelectItem>
          <SelectItem value="active">
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500" />
              Active
            </span>
          </SelectItem>
          <SelectItem value="completed">
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-blue-500" />
              Completed
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className={`w-3 h-3 rounded-full ${styling.dotColor}`} />
        <Badge variant={styling.badgeVariant} className={styling.badgeClass}>
          {styling.badgeText}
        </Badge>
      </div>
    </div>
  );
};

export default SessionStatusComponent;