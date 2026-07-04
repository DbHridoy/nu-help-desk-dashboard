import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="panel rounded-[28px] px-6 py-10 text-center">
      <p className="heading-font text-xl font-semibold">{label}</p>
      <p className="mt-2 text-sm text-[var(--color-text-soft)]">Please wait while data is fetched.</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="panel rounded-[28px] px-6 py-10 text-center">
      <p className="heading-font text-xl font-semibold">Something went wrong</p>
      <p className="mt-2 text-sm text-[var(--color-text-soft)]">{message}</p>
      {onRetry ? (
        <Button className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel rounded-[28px] px-6 py-10 text-center">
      <p className="heading-font text-xl font-semibold">{title}</p>
      <p className="mt-2 text-sm text-[var(--color-text-soft)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
