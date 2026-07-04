import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel hidden rounded-[32px] p-10 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            NU Student Help Website
          </p>
          <h1 className="heading-font mt-5 max-w-xl text-5xl font-bold leading-tight">
            Admin dashboard focused on practical CRUD workflows.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-text-soft)]">
            Manage notices, exam routines, syllabus files, question banks, notes, academic structure, and student
            missing-resource requests from one clean MVP interface.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {["Notices", "Routines", "Syllabus", "Questions", "Resources", "Requests"].map((item) => (
              <div key={item} className="rounded-[24px] border border-[var(--color-border)] bg-white/80 p-4">
                <p className="text-sm font-semibold">{item}</p>
                <p className="mt-2 text-sm text-[var(--color-text-soft)]">CRUD-ready and API-backed.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-strong rounded-[32px] p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            Admin Login
          </p>
          <h2 className="heading-font mt-4 text-4xl font-bold">Sign in</h2>
          <p className="mt-3 text-sm text-[var(--color-text-soft)]">
            Only admin authentication is enabled in this repository. No student login is included.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="text-sm text-[var(--color-text-soft)]">Loading login form...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
