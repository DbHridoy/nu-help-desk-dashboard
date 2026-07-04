import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  children,
  onClose,
  maxWidth = "max-w-4xl",
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={cn("panel-strong w-full rounded-[28px] p-6", maxWidth)}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="heading-font text-2xl font-bold">{title}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-soft)]">
              Review the fields before saving changes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
