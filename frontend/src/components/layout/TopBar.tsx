import { RefreshCw } from "lucide-react";
import { IconButton } from "@/components/ui";

type TopBarProps = {
  connected: boolean | null;
  loading: boolean;
  onRefresh: () => void;
};

export function TopBar({ connected, loading, onRefresh }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 xl:px-10">
      <div className="flex items-center gap-2 text-ui-sm text-slate-400">
        <span className="hidden sm:inline">Рабочее пространство</span>
        <span className="hidden text-slate-300 sm:inline">/</span>
        <strong className="font-semibold text-slate-700">Кампании</strong>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="flex items-center gap-2 text-ui text-slate-500">
          <i
            className={`size-1.5 rounded-full ${
              connected === false ? "bg-rose-500" : "bg-emerald-500"
            }`}
          />
          {connected === null ? "Подключение…" : connected ? "Keitaro подключён" : "Нет подключения"}
        </span>
        <IconButton label="Обновить данные" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
        </IconButton>
      </div>
    </header>
  );
}
