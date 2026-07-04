"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/departments", label: "Departments" },
  { href: "/academic-years", label: "Academic Years" },
  { href: "/subjects", label: "Subjects" },
  { href: "/notices", label: "Notices" },
  { href: "/routines", label: "Routines" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/questions", label: "Questions" },
  { href: "/resources", label: "Resources" },
  { href: "/student-requests", label: "Student Requests" },
  { href: "/uploads", label: "Uploads" },
];

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/30 transition md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "panel fixed inset-y-4 left-4 z-40 flex w-[280px] flex-col rounded-[28px] p-5 transition md:static md:inset-auto md:h-[calc(100vh-2rem)] md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-[120%]",
        )}
      >
        <div className="border-b border-[var(--color-border)] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            NU Student Help
          </p>
          <h1 className="heading-font mt-3 text-2xl font-bold">Admin Console</h1>
          <p className="mt-2 text-sm text-[var(--color-text-soft)]">
            Practical content management for the MVP.
          </p>
        </div>

        <nav className="mt-6 flex-1 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text-soft)] hover:bg-white hover:text-[var(--color-text)]",
                )}
              >
                <span>{item.label}</span>
                <span className={cn("text-xs", active ? "text-white/70" : "text-[var(--color-text-soft)]")}>
                  →
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
