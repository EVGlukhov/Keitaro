import clsx from "clsx";
import { RefreshCw as RefreshCwIcon } from "lucide-react";
import { IconButton, Typography } from "@/components/ui";

type TopBarProps = {
  connected: boolean | null;
  loading: boolean;
  onRefresh: () => void;
};

export function TopBar({ connected, loading, onRefresh }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 xl:px-10">
      <div className="flex items-center gap-2 text-slate-400">
        <Typography variant="uiSmall" className="hidden sm:inline">Рабочее пространство</Typography>
        <Typography variant="uiSmall" className="hidden text-slate-300 sm:inline">/</Typography>
        <Typography as="strong" variant="uiSmall" className="font-semibold text-slate-700">Кампании</Typography>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <Typography as="span" variant="ui" className="flex items-center gap-2 text-slate-500">
          <i
            className={clsx(
              "size-1.5 rounded-full",
              connected === false ? "bg-rose-500" : "bg-emerald-500",
            )}
          />
          {connected === null ? "Подключение…" : connected ? "Keitaro подключён" : "Нет подключения"}
        </Typography>
        <IconButton label="Обновить данные" onClick={onRefresh} disabled={loading}>
          <RefreshCwIcon size={17} className={clsx({ "animate-spin": loading })} />
        </IconButton>
      </div>
    </header>
  );
}
