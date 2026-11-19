import clsx from "clsx";
import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { Typography } from "./Typography";

const labelClass = "block";
const controlClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, className = "", children }: FormFieldProps) {
  return (
    <label className={clsx(labelClass, className)} htmlFor={htmlFor}>
      <Typography variant="label">{label}</Typography>
      {children}
    </label>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  compact?: boolean;
};

export function TextInput({ compact = false, className = "", ...props }: TextInputProps) {
  const spacingClass = compact ? "mt-0" : "mt-1.5";
  return <input className={clsx(controlClass, spacingClass, className)} {...props} />;
}

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
    <select className={clsx(controlClass, spacingClass, className)} {...props}>
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
  );
}
