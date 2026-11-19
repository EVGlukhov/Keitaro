import clsx from "clsx";
import type { InputHTMLAttributes } from "react";

const controlClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  compact?: boolean;
};

export function TextInput({
  compact = false,
  className = "",
  ...props
}: TextInputProps) {
  const spacingClass = compact ? "mt-0" : "mt-1.5";
  return (
    <input
      className={clsx(controlClass, spacingClass, className)}
      {...props}
    />
  );
}
