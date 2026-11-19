import clsx from "clsx";
import type { ReactNode } from "react";
import { Typography } from "./Typography";

const labelClass = "block";

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
