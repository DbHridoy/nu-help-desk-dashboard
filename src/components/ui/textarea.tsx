import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className, id, ...props }: TextareaProps) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      {label ? <span className="text-sm font-semibold text-[var(--color-text-soft)]">{label}</span> : null}
      <textarea
        id={id}
        className={cn(
          "min-h-28 w-full rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-primary)]",
          className,
        )}
        {...props}
      />
      {hint ? <span className="block text-xs text-[var(--color-text-soft)]">{hint}</span> : null}
    </label>
  );
}
