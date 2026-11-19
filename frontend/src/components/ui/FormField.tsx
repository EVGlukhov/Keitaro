import clsx from "clsx";
import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { Typography } from "./Typography";

const labelClass = "block";
const controlClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

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

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  compact?: boolean;
  children: ReactNode;
};

export function SelectInput({
  compact = false,
  className = "",
  children,
  ...props
}: SelectInputProps) {
  const spacingClass = compact ? "mt-0" : "mt-1.5";
  return (
    <select className={clsx(controlClass, spacingClass, className)} {...props}>
      {children}
    </select>
  );
}
