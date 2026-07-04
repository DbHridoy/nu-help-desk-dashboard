"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen p-4 md:p-4">
      <div className="mx-auto flex max-w-[1600px] gap-4">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col gap-4 md:pl-0">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
