import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-strong)]",
        variant === "secondary" &&
          "border border-[var(--color-border-strong)] bg-white text-[var(--color-text)] hover:bg-stone-50",
        variant === "ghost" && "text-[var(--color-text-soft)] hover:bg-white",
        variant === "danger" && "bg-[var(--color-danger)] text-white hover:bg-red-800",
        className,
      )}
      {...props}
    />
  );
}
