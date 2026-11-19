import { X as XIcon } from "lucide-react";
import { CampaignCreateRequest, Metadata } from "@/api";
import { Dialog, IconButton, Typography } from "@/components/ui";
import { CampaignCreateForm } from "@/components/campaigns/CampaignCreateDialog/CampaignCreateForm";

type CampaignCreateDialogProps = {
  metadata: Metadata;
  saving: boolean;
  onClose: () => void;
  onCreate: (campaign: CampaignCreateRequest) => Promise<boolean>;
};

export function CampaignCreateDialog({
  metadata,
  saving,
  onClose,
  onCreate,
}: CampaignCreateDialogProps) {
  return (
    <Dialog labelledBy="modal-title" onClose={onClose}>
      <div className="flex items-start justify-between">
        <div>
          <Typography as="span" variant="caption" className="flex items-center gap-2 font-bold tracking-label text-slate-500">
            <i className="h-0.5 w-3.5 rounded bg-violet-500" />
            НОВАЯ КАМПАНИЯ
          </Typography>
          <Typography as="h2" variant="title" id="modal-title" className="mt-2 font-bold tracking-tight text-slate-900">
            Настроить кампанию
          </Typography>
        </div>
        <IconButton label="Закрыть" onClick={onClose}>
          <XIcon size={18} />
        </IconButton>
      </div>

      <Typography as="p" variant="uiSmall" className="mb-5 mt-2 leading-relaxed text-slate-500">
        Будут созданы два потока: гео-фильтр на Google и поток выбранного оффера.
      </Typography>
      <CampaignCreateForm
        metadata={metadata}
        saving={saving}
        onClose={onClose}
        onCreate={onCreate}
      />
    </Dialog>
  );
}
