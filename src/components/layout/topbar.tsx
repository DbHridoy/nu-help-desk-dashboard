"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";

const pageLabels: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/courses": "Course Management",
  "/departments": "Department Management",
  "/academic-years": "Academic Year Management",
  "/subjects": "Subject Management",
  "/notices": "Notice Management",
  "/routines": "Routine Management",
  "/syllabus": "Syllabus Management",
  "/questions": "Previous Questions",
  "/resources": "Resources and Notes",
  "/student-requests": "Student Requests",
  "/uploads": "Upload Center",
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();

  return (
    <header className="panel flex items-center justify-between rounded-[28px] px-4 py-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-2xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold md:hidden"
        >
          Menu
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Admin
          </p>
          <h2 className="heading-font text-xl font-bold">
            {pageLabels[pathname] ?? "NU Student Help"}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold">{admin?.name ?? "Admin"}</p>
          <p className="text-xs text-[var(--color-text-soft)]">{admin?.email ?? "Unknown user"}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-2xl bg-[var(--color-text)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
