import { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

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
  small: "h-9 gap-1.5 px-3 text-ui",
  medium: "h-10 gap-2 px-4 text-xs",
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
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="animate-spin" size={15} />}
      {children}
    </button>
  );
}
