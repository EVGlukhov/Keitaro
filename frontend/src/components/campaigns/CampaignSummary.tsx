import clsx from "clsx";
import { Globe2 as Globe2Icon, Layers3 as Layers3Icon, Route as RouteIcon } from "lucide-react";
import { ReactNode } from "react";
import { Campaign } from "@/api";
import { Typography } from "@/components/ui";

type CampaignSummaryProps = {
  campaignCount: number;
  selectedCampaign: Campaign | null;
  offerCount: number;
};

function SummaryCard({
  label,
  value,
  detail,
  icon,
  iconClass,
  largeValue = false,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  iconClass: string;
  largeValue?: boolean;
}) {
  return (
    <div className="relative flex min-h-28 flex-col rounded-xl border border-slate-200 bg-white p-4">
      <span className={clsx("absolute right-4 top-4 grid size-8 place-items-center rounded-lg", iconClass)}>
        {icon}
      </span>
      <Typography variant="ui" className="text-slate-500">{label}</Typography>
      <Typography
        as="strong"
        variant={largeValue ? "display" : "small"}
        className={clsx(
          "max-w-summary truncate font-bold",
          largeValue ? "mt-3" : "mt-4",
        )}
      >
        {value}
      </Typography>
      <Typography as="small" variant="caption" className="mt-1 text-slate-400">
        {detail}
      </Typography>
    </div>
  );
}

export function CampaignSummary({
  campaignCount,
  selectedCampaign,
  offerCount,
}: CampaignSummaryProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SummaryCard
        label="Всего кампаний"
        value={campaignCount}
        detail="В аккаунте Keitaro"
        icon={<Layers3Icon size={17} />}
        iconClass="bg-violet-50 text-violet-600"
        largeValue
      />
      <SummaryCard
        label="Выбранная кампания"
        value={selectedCampaign?.name ?? "—"}
        detail={selectedCampaign ? `ID ${selectedCampaign.id}` : "Выберите кампанию ниже"}
        icon={<RouteIcon size={17} />}
        iconClass="bg-blue-50 text-blue-600"
      />
      <SummaryCard
        label="Офферы в редакторе"
        value={offerCount}
        detail="В выбранной кампании"
        icon={<Globe2Icon size={17} />}
        iconClass="bg-emerald-50 text-emerald-600"
        largeValue
      />
    </div>
  );
}
