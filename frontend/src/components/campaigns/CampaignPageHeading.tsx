import { Plus } from "lucide-react";
import { Button, Typography } from "@/components/ui";

type CampaignPageHeadingProps = {
  canCreate: boolean;
  onCreate: () => void;
};

export function CampaignPageHeading({ canCreate, onCreate }: CampaignPageHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Typography as="div" variant="caption" className="mb-2 flex items-center gap-2 font-bold tracking-label text-slate-500">
          <span className="h-0.5 w-3.5 rounded bg-violet-500" />
          ТРЕКИНГ И АНАЛИТИКА
        </Typography>
        <Typography as="h1" variant="pageTitle" className="font-bold tracking-tight text-slate-900">
          Кампании
        </Typography>
        <Typography as="p" variant="body" className="mt-1 text-slate-500">
          Создавайте кампании и управляйте офферами в одном месте.
        </Typography>
      </div>
      <Button onClick={onCreate} disabled={!canCreate}>
        <Plus size={17} /> Создать кампанию
      </Button>
    </div>
  );
}
