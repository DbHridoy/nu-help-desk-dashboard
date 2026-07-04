"use client";

import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state-panels";
import { StatCard } from "@/components/ui/stat-card";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatDate } from "@/lib/utils";

export function DashboardPage() {
  const { data, loading, error, refresh } = useDashboardData();

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (error || !data) {
    return <ErrorState message={error ?? "Failed to load dashboard"} onRetry={refresh} />;
  }

  return (
    <div className="space-y-4">
      <section className="panel rounded-[28px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Dashboard Overview
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="heading-font text-3xl font-bold">Admin dashboard for the MVP</h1>
            <p className="mt-2 max-w-3xl text-sm text-[var(--color-text-soft)]">
              Monitor the latest notices, routines, syllabus files, questions, resources, and incoming student requests
              from a single place.
            </p>
          </div>
          <Badge tone="info">Pagination-ready CRUD screens enabled</Badge>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Notices" value={data.totalNotices} note="Published and draft notices combined." />
        <StatCard label="Total Routines" value={data.totalRoutines} note="Exam routines across academic years." />
        <StatCard label="Total Syllabus Files" value={data.totalSyllabusFiles} note="Syllabus entries ready for download." />
        <StatCard label="Total Questions" value={data.totalQuestions} note="Previous question sets available in admin." />
        <StatCard label="Total Resources" value={data.totalResources} note="Notes, suggestions, and model questions." />
        <StatCard
          label="Student Requests"
          value={data.totalStudentRequests}
          note="Pending, completed, and rejected requests."
        />
      </section>

      <section className="panel rounded-[28px] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="heading-font text-2xl font-bold">Recently added resources</h2>
            <p className="mt-1 text-sm text-[var(--color-text-soft)]">
              Quick access to the latest notes and important content uploads.
            </p>
          </div>
        </div>

        {data.recentResources.length ? (
          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {data.recentResources.map((resource) => (
              <article key={resource.id} className="rounded-[24px] border border-[var(--color-border)] bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="info">{resource.resourceType}</Badge>
                  {resource.isVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Review</Badge>}
                  {resource.isPublished ? <Badge tone="success">Published</Badge> : <Badge>Draft</Badge>}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{resource.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-soft)]">{resource.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
                  Added {formatDate(resource.createdAt, true)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="No recent resources"
              description="Resources added through the admin panel will appear here."
            />
          </div>
        )}
      </section>
    </div>
  );
}
