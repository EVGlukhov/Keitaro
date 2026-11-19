import { ReactNode } from "react";
import { Typography } from "@/components/ui";

type CampaignListStateProps = {
  icon?: ReactNode;
  message: string;
};

export function CampaignListState({ icon, message }: CampaignListStateProps) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-slate-400">
      {icon}
      <Typography variant="uiSmall">{message}</Typography>
    </div>
  );
}
