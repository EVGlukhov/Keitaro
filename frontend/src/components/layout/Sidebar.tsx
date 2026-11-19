import {
  Activity,
  ArrowUpRight,
  CircleHelp,
  Layers3,
  Radio,
} from "lucide-react";

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
      <div className="flex items-center gap-2.5 px-2 font-semibold tracking-tight text-slate-900">
        <div className="grid size-8 place-items-center rounded-lg bg-violet-600 text-white">
          <Activity size={20} strokeWidth={2.5} />
        </div>
        <span className="text-lg">
          keitaro<span className="font-medium text-violet-500">studio</span>
        </span>
      </div>

      <div className="mb-3 mt-10 px-2 text-caption font-bold tracking-label text-slate-400">
        РАБОЧЕЕ ПРОСТРАНСТВО
      </div>
      <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-sm font-bold text-violet-600">
          K
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <strong className="truncate text-ui-sm font-semibold">Keitaro tracker</strong>
          <small className="text-caption text-slate-400">Подключение через API</small>
        </div>
        <span className={`ml-auto size-2 shrink-0 rounded-full ring-4 ${connectionColor}`} />
      </div>

      <div className="mb-2 mt-8 px-2 text-caption font-bold tracking-label text-slate-400">
        УПРАВЛЕНИЕ
      </div>
      <div className="mb-1 flex items-center gap-2.5 rounded-lg bg-violet-50 px-3 py-2.5 text-xs font-semibold text-violet-700">
        <Layers3 size={17} />
        Кампании
        <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-ui text-violet-700">
          {campaignCount}
        </span>
      </div>
      <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-slate-400">
        <Radio size={17} />
        Источники и офферы
      </div>

      <div className="mt-auto">
        <div className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 grid size-7 place-items-center rounded-lg bg-violet-50 text-violet-600">
            <CircleHelp size={17} />
          </div>
          <strong className="text-ui-sm font-semibold">Нужна помощь?</strong>
          <p className="mb-2 mt-1 text-ui leading-relaxed text-slate-500">
            Проверьте доступ к Keitaro API и настройки подключения.
          </p>
          <a
            className="inline-flex items-center gap-1 text-ui font-semibold text-violet-600 hover:text-violet-800"
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
          >
            Документация API <ArrowUpRight size={13} />
          </a>
        </div>
        <div className="mt-4 flex items-center gap-2.5 border-t border-slate-100 px-1 pt-4">
          <div className="grid size-8 place-items-center rounded-full bg-violet-600 text-ui font-bold text-white">
            KS
          </div>
          <div className="flex flex-col gap-0.5">
            <strong className="text-ui-sm font-semibold">Keitaro Studio</strong>
            <small className="text-caption text-slate-400">Тестовое окружение</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
