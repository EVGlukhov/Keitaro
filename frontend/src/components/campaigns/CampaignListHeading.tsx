type CampaignListHeadingProps = {
  campaignCount: number;
};

export function CampaignListHeading({ campaignCount }: CampaignListHeadingProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <h2 className="text-sm font-bold text-slate-800">Список кампаний</h2>
        <p className="mt-1 text-ui text-slate-500">
          Выберите кампанию, чтобы изменить её потоки офферов.
        </p>
      </div>
      <span className="rounded-full bg-slate-200/70 px-2.5 py-1 text-caption text-slate-600">
        {campaignCount} записей
      </span>
    </div>
  );
}
