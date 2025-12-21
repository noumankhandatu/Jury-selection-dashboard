import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LucideIcon } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  Children?: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
}

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
  Children = undefined,
  icon: Icon,
  iconClassName = ""
}: ConfirmationDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-4 mb-2">
            {Icon && (
              <div className={`flex-shrink-0 ${iconClassName || "text-[#5156be]"}`}>
                <Icon className="h-8 w-8" />
              </div>
            )}
            <AlertDialogTitle className="text-2xl font-bold">{title}</AlertDialogTitle>
          </div>
          {typeof description === 'string' ? (
            <AlertDialogDescription className="text-base leading-relaxed pt-2">
              {description}
              {Children}
            </AlertDialogDescription>
          ) : (
            <div className="text-base leading-relaxed pt-2 text-muted-foreground">
              {description}
              {Children}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel disabled={isLoading} className="px-6 py-2">{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={variant === "destructive" ? "bg-red-600 hover:bg-red-700 px-6 py-2" : "px-6 py-2"}
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;