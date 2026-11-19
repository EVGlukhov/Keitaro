import { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  size?: "small" | "medium";
  children: ReactNode;
};

export function IconButton({
  label,
  size = "medium",
  children,
  className = "",
  ...props
}: IconButtonProps) {
  const sizeClass = size === "small" ? "size-6" : "size-9";
  return (
    <button
      className={`inline-grid ${sizeClass} place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
}
