import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type SelectableButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
};

export function SelectableButton({
  selected,
  className,
  ...props
}: SelectableButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "transition hover:bg-violet-50/50",
        selected ? "bg-violet-50/70 shadow-selected" : "bg-white",
        className,
      )}
      aria-pressed={selected}
    />
  );
}
