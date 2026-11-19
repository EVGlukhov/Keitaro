import { Typography } from "@/components/ui";

type CampaignListHeadingProps = {
  campaignCount: number;
};

export function CampaignListHeading({ campaignCount }: CampaignListHeadingProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <Typography as="h2" variant="small" className="font-bold text-slate-800">
          Список кампаний
        </Typography>
        <Typography as="p" variant="ui" className="mt-1 text-slate-500">
          Выберите кампанию, чтобы изменить её потоки офферов.
        </Typography>
      </div>
      <Typography as="span" variant="caption" className="rounded-full bg-slate-200/70 px-2.5 py-1 text-slate-600">
        {campaignCount} записей
      </Typography>
    </div>
  );
}
