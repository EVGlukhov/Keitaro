import clsx from "clsx";
import {
  Activity,
  ArrowUpRight,
  CircleHelp,
  Layers3,
  Radio,
} from "lucide-react";
import { Typography } from "@/components/ui";

type SidebarProps = {
  campaignCount: number;
  connected: boolean | null;
};

export function Sidebar({ campaignCount, connected }: SidebarProps) {
  const connectionColor =
    connected === false
      ? "bg-rose-500 ring-rose-50"
      : connected === null
        ? "bg-amber-400 ring-amber-50"
        : "bg-emerald-500 ring-emerald-50";

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-7 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <div className="grid size-8 place-items-center rounded-lg bg-violet-600 text-white">
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <Typography variant="large" className="font-semibold tracking-tight text-slate-900">
          keitaro<Typography variant="inherit" className="font-medium text-violet-500">studio</Typography>
        </Typography>
      </div>

      <Typography as="div" variant="caption" className="mb-3 mt-10 px-2 font-bold tracking-label text-slate-400">
        РАБОЧЕЕ ПРОСТРАНСТВО
      </Typography>
      <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5">
        <Typography as="div" variant="small" className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 font-bold text-violet-600">
          K
        </Typography>
        <div className="flex min-w-0 flex-col gap-0.5">
          <Typography as="strong" variant="uiSmall" className="truncate font-semibold">Keitaro tracker</Typography>
          <Typography as="small" variant="caption" className="text-slate-400">Подключение через API</Typography>
        </div>
        <span className={clsx("ml-auto size-2 shrink-0 rounded-full ring-4", connectionColor)} />
      </div>

      <Typography as="div" variant="caption" className="mb-2 mt-8 px-2 font-bold tracking-label text-slate-400">
        УПРАВЛЕНИЕ
      </Typography>
      <div className="mb-1 flex items-center gap-2.5 rounded-lg bg-violet-50 px-3 py-2.5 font-semibold text-violet-700">
        <Layers3 size={17} />
        <Typography variant="body">Кампании</Typography>
        <Typography variant="ui" className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-violet-700">
          {campaignCount}
        </Typography>
      </div>
      <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-slate-400">
        <Radio size={17} />
        <Typography variant="body">Источники и офферы</Typography>
      </div>

      <div className="mt-auto">
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 grid size-7 place-items-center rounded-lg bg-violet-50 text-violet-600">
            <CircleHelp size={17} />
          </div>
          <Typography as="strong" variant="uiSmall" className="font-semibold">Нужна помощь?</Typography>
          <Typography as="p" variant="ui" className="mb-2 mt-1 leading-relaxed text-slate-500">
            Проверьте доступ к Keitaro API и настройки подключения.
          </Typography>
          <a
            className="inline-flex items-center gap-1 text-ui font-semibold text-violet-600 hover:text-violet-800"
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
          >
            <Typography variant="ui">Документация API</Typography>
            <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="mt-4 flex items-center gap-2.5 border-t border-slate-100 px-1 pt-4">
          <Typography as="div" variant="ui" className="grid size-8 place-items-center rounded-full bg-violet-600 font-bold text-white">
            KS
          </Typography>
          <div className="flex flex-col gap-0.5">
            <Typography as="strong" variant="uiSmall" className="font-semibold">Keitaro Studio</Typography>
            <Typography as="small" variant="caption" className="text-slate-400">Тестовое окружение</Typography>
          </div>
        </div>
      </div>
    </aside>
  );
}
