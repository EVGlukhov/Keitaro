import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("focuses the first field and traps Tab navigation", async () => {
    const user = userEvent.setup();
    render(
      <Dialog labelledBy="dialog-title" onClose={vi.fn()}>
        <h2 id="dialog-title">Dialog title</h2>
        <input aria-label="First field" />
        <button>Last action</button>
      </Dialog>,
    );

    const firstField = screen.getByRole("textbox", { name: "First field" });
    const lastAction = screen.getByRole("button", { name: "Last action" });

    expect(firstField).toHaveFocus();
    await user.tab({ shift: true });
    expect(lastAction).toHaveFocus();
    await user.tab();
    expect(firstField).toHaveFocus();
  });

  it("calls onClose when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Dialog labelledBy="dialog-title" onClose={onClose}>
        <h2 id="dialog-title">Dialog title</h2>
        <button>Action</button>
      </Dialog>,
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("restores focus to the previously active element on unmount", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open dialog";
    document.body.append(trigger);
    trigger.focus();

    const { unmount } = render(
      <Dialog labelledBy="dialog-title" onClose={vi.fn()}>
        <h2 id="dialog-title">Dialog title</h2>
        <button>Action</button>
      </Dialog>,
    );

    expect(screen.getByRole("button", { name: "Action" })).toHaveFocus();
    unmount();

    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
