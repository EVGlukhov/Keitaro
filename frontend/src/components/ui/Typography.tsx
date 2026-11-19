import { ComponentPropsWithoutRef, ElementType } from "react";
import clsx from "clsx";

type TypographyVariant =
  | "inherit"
  | "micro"
  | "caption"
  | "ui"
  | "uiSmall"
  | "section"
  | "small"
  | "body"
  | "large"
  | "title"
  | "display"
  | "pageTitle"
  | "label";

type TypographyProps<T extends ElementType> = {
  as?: T;
  variant?: TypographyVariant;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

const variants: Record<TypographyVariant, string> = {
  inherit: "",
  micro: "text-micro",
  caption: "text-caption",
  ui: "text-ui",
  uiSmall: "text-ui-sm",
  section: "text-section",
  small: "text-sm",
  body: "text-xs",
  large: "text-lg",
  title: "text-xl",
  display: "text-2xl",
  pageTitle: "text-2xl sm:text-3xl",
  label: "text-ui-sm font-semibold text-slate-600",
};

export function Typography<T extends ElementType = "span">({
  as,
  variant = "ui",
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as ?? "span";
  return <Component className={clsx(variants[variant], className)} {...props} />;
}
