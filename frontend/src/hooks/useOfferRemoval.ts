import { useState } from "react";
import { Stream } from "@/api";

export function useOfferRemoval(
  onRemoveOffer: (stream: Stream) => Promise<boolean>,
) {
  const [streamToRemove, setStreamToRemove] = useState<Stream | null>(null);

  function requestRemoval(stream: Stream) {
    setStreamToRemove(stream);
  }

  function cancelRemoval() {
    setStreamToRemove(null);
  }

  async function confirmRemoval() {
    if (streamToRemove && (await onRemoveOffer(streamToRemove))) {
      setStreamToRemove(null);
    }
  }

  return {
    cancelRemoval,
    confirmRemoval,
    requestRemoval,
    streamToRemove,
  };
}
