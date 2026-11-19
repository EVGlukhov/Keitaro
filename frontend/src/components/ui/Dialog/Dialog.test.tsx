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
        <button>Close dialog</button>
        <input aria-label="First field" />
        <button>Last action</button>
      </Dialog>,
    );

    const firstField = screen.getByRole("textbox", { name: "First field" });
    const closeButton = screen.getByRole("button", { name: "Close dialog" });
    const lastAction = screen.getByRole("button", { name: "Last action" });

    expect(firstField).toHaveFocus();
    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();
    await user.tab({ shift: true });
    expect(lastAction).toHaveFocus();
    await user.tab();
    expect(closeButton).toHaveFocus();
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

  it("uses its accessible description and skips hidden controls while trapping focus", async () => {
    const user = userEvent.setup();
    render(
      <Dialog
        labelledBy="dialog-title"
        describedBy="dialog-description"
        onClose={vi.fn()}
      >
        <h2 id="dialog-title">Dialog title</h2>
        <p id="dialog-description">Dialog instructions</p>
        <button>First action</button>
        <button hidden>Hidden action</button>
        <button>Last action</button>
      </Dialog>,
    );

    expect(
      screen.getByRole("dialog", {
        name: "Dialog title",
        description: "Dialog instructions",
      }),
    ).toBeInTheDocument();

    const firstAction = screen.getByRole("button", { name: "First action" });
    const lastAction = screen.getByRole("button", { name: "Last action" });
    expect(firstAction).toHaveFocus();

    await user.tab();
    expect(lastAction).toHaveFocus();
    await user.tab();
    expect(firstAction).toHaveFocus();
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
