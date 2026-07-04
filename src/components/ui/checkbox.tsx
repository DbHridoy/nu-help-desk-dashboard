import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hint?: string;
}

export function Checkbox({ label, hint, checked, ...props }: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        className="mt-1 h-4 w-4 rounded border-[var(--color-border-strong)] text-[var(--color-primary)]"
        {...props}
      />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint ? <span className="text-xs text-[var(--color-text-soft)]">{hint}</span> : null}
      </span>
    </label>
  );
}
