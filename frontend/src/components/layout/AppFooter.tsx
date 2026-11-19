import { Typography } from "@/components/ui";

export function AppFooter() {
  return (
    <footer className="py-7 text-center text-slate-500">
      <Typography variant="caption">
        Keitaro Studio <Typography variant="inherit" className="mx-1 text-slate-500">•</Typography>
        Тестовое приложение
        <Typography variant="inherit" className="mx-1 text-slate-500">•</Typography>
        Данные синхронизируются с Keitaro
      </Typography>
    </footer>
  );
}
