import { Plus } from "lucide-react";
import { Button } from "@/components/ui";

type CampaignPageHeadingProps = {
  canCreate: boolean;
  onCreate: () => void;
};

export function CampaignPageHeading({ canCreate, onCreate }: CampaignPageHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-caption font-bold tracking-label text-slate-500">
          <span className="h-0.5 w-3.5 rounded bg-violet-500" />
          ТРЕКИНГ И АНАЛИТИКА
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Кампании
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Создавайте кампании и управляйте офферами в одном месте.
        </p>
      </div>
      <Button onClick={onCreate} disabled={!canCreate}>
        <Plus size={17} /> Создать кампанию
      </Button>
    </div>
  );
}
