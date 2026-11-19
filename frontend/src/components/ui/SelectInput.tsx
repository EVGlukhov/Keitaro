import clsx from "clsx";
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { Typography } from "./Typography";

const controlClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

type SelectInputProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  options: readonly SelectInputOption[];
  compact?: boolean;
};

export type SelectInputOption = {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
};

export function SelectInput({
  compact = false,
  className = "",
  options,
  ...props
}: SelectInputProps) {
  const spacingClass = compact ? "mt-0" : "mt-1.5";
  return (
    <div className={clsx("group relative min-w-0", spacingClass, className)}>
      <select
        className={clsx(
          controlClass,
          "cursor-pointer appearance-none pr-10 focus:border-violet-500 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
        )}
        {...props}
      >
        {options.map((option) => (
          <Typography
            as="option"
            variant="inherit"
            key={String(option.value)}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </Typography>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-violet-600"
        size={16}
        strokeWidth={1.8}
      />
    </div>
  );
}
