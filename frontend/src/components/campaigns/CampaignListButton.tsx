import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type CampaignListButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
};

export function CampaignListButton({
  selected,
  className,
  ...props
}: CampaignListButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "grid min-h-13 w-full grid-cols-campaign items-center gap-2 border-b border-slate-100 px-3 text-left text-slate-500 transition last:border-0 hover:bg-violet-50/50 sm:grid-cols-campaign-wide sm:gap-3 sm:px-4",
        selected ? "bg-violet-50/70 shadow-selected" : "bg-white",
        className,
      )}
      aria-pressed={selected}
    />
  );
}
