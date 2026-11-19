import clsx from "clsx";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle as LoaderCircleIcon } from "lucide-react";
import { Typography } from "./Typography";

type ButtonVariant = "primary" | "secondary" | "quiet";
type ButtonSize = "small" | "medium";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-violet-600 text-white shadow-sm hover:bg-violet-700 focus:ring-violet-200",
  secondary:
    "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:ring-violet-100",
  quiet:
    "text-slate-500 hover:bg-slate-100 focus:ring-violet-100",
};

const sizes: Record<ButtonSize, string> = {
  small: "h-9 px-3",
  medium: "h-10 px-4",
};

const textGaps: Record<ButtonSize, string> = {
  small: "gap-1.5",
  medium: "gap-2",
};

export function Button({
  variant = "primary",
  size = "medium",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircleIcon className="animate-spin" size={15} />}
      <Typography
        variant={size === "small" ? "ui" : "body"}
        className={clsx("inline-flex items-center", textGaps[size])}
      >
        {children}
      </Typography>
    </button>
  );
}
