import clsx from "clsx";
import { X as XIcon } from "lucide-react";
import { Button, IconButton, Typography } from "@/components/ui";

type FeedbackBannerProps = {
  error: string;
  notice: string;
  onDismiss: () => void;
  onRetry?: () => void;
};

export function FeedbackBanner({
  error,
  notice,
  onDismiss,
  onRetry,
}: FeedbackBannerProps) {
  const message = error || notice;
  if (!message) return null;

  return (
    <div
      role={error ? "alert" : "status"}
      className={clsx(
        "mb-5 flex items-center justify-between rounded-lg border px-3 py-2.5 text-xs",
        error
          ? "border-rose-200 bg-rose-50 text-rose-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
      )}
    >
      <div className="flex items-center gap-3">
        <Typography variant="body">{message}</Typography>
        {error && onRetry && (
          <Button size="small" variant="secondary" onClick={onRetry}>
            Повторить загрузку
          </Button>
        )}
        <IconButton
          size="small"
          className="ml-3 border-0 bg-transparent text-current hover:bg-black/5"
          label="Закрыть"
          onClick={onDismiss}
        >
          <XIcon size={15} />
        </IconButton>
      </div>
    </div>
  );
}
