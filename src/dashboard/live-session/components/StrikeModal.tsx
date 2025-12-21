import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Gavel, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

interface StrikeModalProps {
  open: boolean;
  onClose: () => void;
  jurorName: string;
  jurorNumber?: string;
  sessionId: string;
  jurorId: string;
  currentStrike?: {
    strikeRecommendation: "STRIKE_FOR_CAUSE" | "PEREMPTORY_STRIKE" | null;
    strikeReason?: string | null;
  } | null;
  onStrikeUpdated?: () => void;
}

type StrikeType = "STRIKE_FOR_CAUSE" | "PEREMPTORY_STRIKE" | null;

const StrikeModal = ({
  open,
  onClose,
  jurorName,
  jurorNumber,
  sessionId,
  jurorId,
  currentStrike,
  onStrikeUpdated,
}: StrikeModalProps) => {
  const [strikeType, setStrikeType] = useState<StrikeType>(
    currentStrike?.strikeRecommendation || null
  );
  const [reason, setReason] = useState(currentStrike?.strikeReason || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update form when currentStrike changes
  useEffect(() => {
    if (currentStrike) {
      setStrikeType(currentStrike.strikeRecommendation);
      setReason(currentStrike.strikeReason || "");
    } else {
      setStrikeType(null);
      setReason("");
    }
  }, [currentStrike, open]);

  const handleSave = async () => {
    // Validate: STRIKE_FOR_CAUSE requires a reason
    if (strikeType === "STRIKE_FOR_CAUSE" && !reason.trim()) {
      toast.error("Reason is required for Strike for Cause");
      return;
    }

    setIsSaving(true);
    try {
      const { updateJurorStrikeApi } = await import("@/api/api");
      await updateJurorStrikeApi(sessionId, jurorId, {
        strikeRecommendation: strikeType,
        strikeReason: reason.trim() || undefined,
      });

      toast.success("Strike updated successfully");
      onStrikeUpdated?.();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update strike";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    try {
      const { updateJurorStrikeApi } = await import("@/api/api");
      await updateJurorStrikeApi(sessionId, jurorId, {
        strikeRecommendation: null,
        strikeReason: undefined,
      });

      toast.success("Strike removed successfully");
      onStrikeUpdated?.();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to remove strike";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setStrikeType(currentStrike?.strikeRecommendation || null);
      setReason(currentStrike?.strikeReason || "");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-amber-600" />
            Strike Recommendation
          </DialogTitle>
          <DialogDescription>
            {jurorName}
            {jurorNumber && ` (${jurorNumber})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Strike Type</Label>
            <RadioGroup
              value={strikeType || ""}
              onValueChange={(value) =>
                setStrikeType(value as StrikeType)
              }
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <RadioGroupItem
                  value="STRIKE_FOR_CAUSE"
                  id="strike-for-cause"
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="strike-for-cause"
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Strike for Cause
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Juror shows clear bias, conflict of interest, or legal
                    grounds for cause. Reason is required.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <RadioGroupItem
                  value="PEREMPTORY_STRIKE"
                  id="peremptory-strike"
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor="peremptory-strike"
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Gavel className="h-4 w-4 text-amber-600" />
                    Peremptory Strike
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Strategic strike without needing to show cause. Reason is
                    optional.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <RadioGroupItem value="" id="no-strike" className="mt-1" />
                <div className="flex-1">
                  <Label
                    htmlFor="no-strike"
                    className="flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                    No Strike
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Remove strike recommendation for this juror.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {strikeType && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-base font-semibold">
                Reason
                {strikeType === "STRIKE_FOR_CAUSE" && (
                  <span className="text-red-600 ml-1">*</span>
                )}
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  strikeType === "STRIKE_FOR_CAUSE"
                    ? "Enter the reason for strike for cause (required)..."
                    : "Enter the reason for peremptory strike (optional)..."
                }
                rows={4}
                className="resize-none"
              />
              {strikeType === "PEREMPTORY_STRIKE" && (
                <p className="text-xs text-gray-500">
                  Reason is optional for peremptory strikes
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {currentStrike?.strikeRecommendation && (
              <Button
                variant="outline"
                onClick={handleRemove}
                disabled={isSaving}
                className="text-red-600 hover:text-red-700"
              >
                Remove Strike
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving ||
                (strikeType === "STRIKE_FOR_CAUSE" && !reason.trim())
              }
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSaving ? "Saving..." : "Save Strike"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StrikeModal;



