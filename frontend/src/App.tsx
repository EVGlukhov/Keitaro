import { useState } from "react";
import {
  AppFooter,
  CampaignCreateDialog,
  CampaignList,
  CampaignListHeading,
  CampaignPageHeading,
  CampaignSummary,
  FeedbackBanner,
  OfferEditor,
  Sidebar,
  TopBar,
} from "@/components";
import { useAppSelector } from "@/store/hooks";
import { useCampaignPageController } from "@/hooks/useCampaignPageController";

export default function App() {
  const page = useCampaignPageController();
  const {
    campaigns,
    connected,
    error,
    loading,
    metadata,
    notice,
    saving,
    selectedCampaign,
    selectedId,
  } = useAppSelector((state) => state.campaigns);
  const [createOpen, setCreateOpen] = useState(false);
  const streams = selectedCampaign?.streams ?? [];
  const offerCount = streams.filter((stream) => stream.action_type === "offer").length;

  return (
    <main className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar campaignCount={campaigns.length} connected={connected} />
      <section className="min-w-0 flex-1">
        <TopBar
          connected={connected}
          loading={loading}
          onRefresh={page.refresh}
        />

        <div className="mx-auto max-w-content px-4 pb-5 pt-7 sm:px-6 xl:px-10 xl:pt-9">
          <CampaignPageHeading
            canCreate={metadata !== null}
            onCreate={() => setCreateOpen(true)}
          />

          <FeedbackBanner
            error={error}
            notice={notice}
            onDismiss={page.dismissFeedback}
          />

          <CampaignSummary
            campaignCount={campaigns.length}
            selectedCampaign={selectedCampaign}
            offerCount={offerCount}
          />

          <CampaignListHeading campaignCount={campaigns.length} />

          <div className="grid items-start gap-4 xl:grid-cols-dashboard">
            <CampaignList
              campaigns={campaigns}
              loading={loading}
              selectedId={selectedId}
              selectedStreamCount={streams.length}
              onSelect={page.selectCampaign}
            />
            <OfferEditor
              campaign={selectedCampaign}
              metadata={metadata}
              saving={saving}
              onAddOffer={page.addOffer}
              onRemoveOffer={page.removeOffer}
            />
          </div>

          <AppFooter />
        </div>
      </section>

      {createOpen && metadata && (
        <CampaignCreateDialog
          metadata={metadata}
          saving={saving}
          onClose={() => setCreateOpen(false)}
          onCreate={page.createCampaign}
        />
      )}
    </main>
  );
}
