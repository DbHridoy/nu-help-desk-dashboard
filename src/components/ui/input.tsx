import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className, id, ...props }: InputProps) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      {label ? <span className="text-sm font-semibold text-[var(--color-text-soft)]">{label}</span> : null}
      <input
        id={id}
        className={cn(
          "w-full rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-primary)]",
          className,
        )}
        {...props}
      />
      {hint ? <span className="block text-xs text-[var(--color-text-soft)]">{hint}</span> : null}
    </label>
  );
}
