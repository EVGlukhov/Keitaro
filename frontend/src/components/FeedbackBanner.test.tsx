import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FeedbackBanner } from "./FeedbackBanner";

describe("FeedbackBanner", () => {
  it("announces errors and allows dismissing them", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <FeedbackBanner
        error="Keitaro is unavailable"
        notice=""
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Keitaro is unavailable");
    await user.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("announces successful operations as a status", () => {
    render(
      <FeedbackBanner
        error=""
        notice="Offer added"
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Offer added");
  });
});
