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
import { countOffers } from "@/utils/campaign";

export default function App() {
  const page = useCampaignPageController();
  const {
    campaigns,
    campaignCount,
    connected,
    detailError,
    detailLoading,
    error,
    loading,
    listLoading,
    filteredCampaignCount,
    metadata,
    notice,
    saving,
    selectedCampaign,
    selectedId,
  } = useAppSelector((state) => state.campaigns);
  const [createOpen, setCreateOpen] = useState(false);
  const streams = selectedCampaign?.streams ?? [];
  const offerCount = countOffers(streams);

  return (
    <main className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar campaignCount={campaignCount} connected={connected} />
      <section className="min-w-0 flex-1">
        <TopBar
          connected={connected}
          loading={loading || listLoading}
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
            onRetry={connected === false ? page.refresh : undefined}
          />

          <CampaignSummary
            campaignCount={campaignCount}
            selectedCampaign={selectedCampaign}
            offerCount={offerCount}
          />

          <CampaignListHeading campaignCount={campaignCount} />

          <div className="grid items-start gap-4 xl:grid-cols-dashboard">
            <CampaignList
              campaigns={campaigns}
              loading={listLoading}
              campaignCount={campaignCount}
              total={filteredCampaignCount}
              onQueryChange={page.queryCampaigns}
              selectedId={selectedId}
              selectedStreamCount={streams.length}
              onSelect={page.selectCampaign}
            />
            <OfferEditor
              campaign={selectedCampaign}
              detailError={detailError}
              detailLoading={detailLoading}
              metadata={metadata}
              saving={saving}
              onAddOffer={page.addOffer}
              onRemoveOffer={page.removeOffer}
              onRetryDetail={page.retryCampaign}
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
