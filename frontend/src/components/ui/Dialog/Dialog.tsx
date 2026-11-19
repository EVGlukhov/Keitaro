import { ReactNode } from "react";
import styles from "./Dialog.module.css";

type DialogProps = {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
};

export function Dialog({ labelledBy, onClose, children }: DialogProps) {
  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </section>
    </div>
  );
}
