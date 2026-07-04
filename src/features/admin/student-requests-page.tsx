"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state-panels";
import { useCrudResource } from "@/hooks/useCrudResource";
import { useReferenceData } from "@/hooks/useReferenceData";
import { adminApi } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import type { StudentRequestStatus } from "@/types";

function statusBadge(status: StudentRequestStatus) {
  if (status === "completed") {
    return <Badge tone="success">Completed</Badge>;
  }

  if (status === "rejected") {
    return <Badge tone="danger">Rejected</Badge>;
  }

  return <Badge tone="warning">Pending</Badge>;
}

export function StudentRequestsPage() {
  const { items, loading, error, setItems, refresh } = useCrudResource("student-requests");
  const refs = useReferenceData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const keyword = search.trim().toLowerCase();
      const haystack = [item.name, item.whatTheyNeed, item.message]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !keyword || haystack.includes(keyword);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  async function updateStatus(id: string, status: StudentRequestStatus) {
    setUpdatingId(id);
    try {
      const updated = await adminApi.updateStudentRequestStatus(id, status);
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading || refs.loading) {
    return <LoadingState label="Loading student requests..." />;
  }

  if (error || refs.error) {
    return <ErrorState message={error ?? refs.error ?? "Failed to load requests"} onRetry={refresh} />;
  }

  return (
    <div className="space-y-4">
      <section className="panel rounded-[28px] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              Student Requests
            </p>
            <h1 className="heading-font mt-2 text-3xl font-bold">Missing-resource request queue</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-soft)]">
              Review what students need, then mark each request as pending, completed, or rejected.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search requests"
              className="rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-sm outline-none"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </section>

      {filteredItems.length ? (
        <DataTable
          rows={filteredItems}
          rowKey={(row) => row.id}
          columns={[
            {
              key: "student",
              label: "Student",
              render: (row) => (
                <div>
                  <div className="font-semibold">{row.name || "Anonymous request"}</div>
                  <div className="text-xs text-[var(--color-text-soft)]">{formatDate(row.createdAt, true)}</div>
                </div>
              ),
            },
            {
              key: "scope",
              label: "Course Scope",
              render: (row) => (
                <div className="space-y-1 text-sm">
                  <div>{refs.maps.courseMap[row.course ?? ""] ?? "-"}</div>
                  <div className="text-[var(--color-text-soft)]">{refs.maps.departmentMap[row.department ?? ""] ?? "-"}</div>
                  <div className="text-[var(--color-text-soft)]">{refs.maps.academicYearMap[row.academicYear ?? ""] ?? "-"}</div>
                </div>
              ),
            },
            {
              key: "need",
              label: "Need",
              render: (row) => (
                <div>
                  <div className="font-semibold">{row.whatTheyNeed}</div>
                  <div className="mt-1 text-sm text-[var(--color-text-soft)]">{row.message}</div>
                </div>
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (row) => statusBadge(row.status),
            },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={updatingId === row.id}
                    onClick={() => updateStatus(row.id, "pending")}
                  >
                    Pending
                  </Button>
                  <Button
                    disabled={updatingId === row.id}
                    onClick={() => updateStatus(row.id, "completed")}
                  >
                    Complete
                  </Button>
                  <Button
                    variant="danger"
                    disabled={updatingId === row.id}
                    onClick={() => updateStatus(row.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              ),
            },
          ]}
        />
      ) : (
        <EmptyState
          title="No matching requests"
          description="Try a different search term or filter to find student submissions."
        />
      )}
    </div>
  );
}
