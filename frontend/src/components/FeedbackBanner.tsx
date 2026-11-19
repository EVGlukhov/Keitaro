import { X } from "lucide-react";
import { IconButton } from "@/components/ui";

type FeedbackBannerProps = {
  error: string;
  notice: string;
  onDismiss: () => void;
};

export function FeedbackBanner({ error, notice, onDismiss }: FeedbackBannerProps) {
  const message = error || notice;
  if (!message) return null;

  return (
    <div
      className={`mb-5 flex items-center justify-between rounded-lg border px-3 py-2.5 text-xs ${
        error
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      <span>{message}</span>
      <IconButton
        size="small"
        className="ml-3 border-0 bg-transparent text-current hover:bg-black/5"
        label="Закрыть"
        onClick={onDismiss}
      >
        <X size={15} />
      </IconButton>
    </div>
  );
}
