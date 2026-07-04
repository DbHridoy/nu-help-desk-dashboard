"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state-panels";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EntityForm, type FieldConfig, type FormValues } from "@/components/forms/entity-form";
import { Badge } from "@/components/ui/badge";
import { useCrudResource } from "@/hooks/useCrudResource";
import { useReferenceData } from "@/hooks/useReferenceData";
import { createReferenceBundle, crudConfigs } from "@/features/admin/crud-config";
import { formatDate } from "@/lib/utils";
import type { AdminResource, EntityMap, UploadedFile } from "@/types";

function normalizeValues(values: FormValues) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      if (value === "") {
        return [key, undefined];
      }
      return [key, value];
    }),
  );
}

function filesColumn<T extends { files?: UploadedFile[] }>() {
  const column: DataColumn<T> = {
    key: "files",
    label: "Files",
    render: (row) =>
      row.files?.length ? (
        <div className="space-y-2">
          {row.files.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="block text-sm font-semibold text-[var(--color-primary)]"
            >
              {file.name}
            </a>
          ))}
        </div>
      ) : (
        <span className="text-[var(--color-text-soft)]">No files</span>
      ),
  };
  return column;
}

export function EntityManagerPage<R extends Exclude<AdminResource, "student-requests">>({
  resource,
}: {
  resource: R;
}) {
  const config = crudConfigs[resource] as (typeof crudConfigs)[R];
  const { items, loading, error, refresh, createItem, updateItem, removeItem } = useCrudResource(resource);
  const refs = useReferenceData();
  const referenceBundle = useMemo(
    () =>
      createReferenceBundle({
        courseMap: refs.maps.courseMap,
        departmentMap: refs.maps.departmentMap,
        academicYearMap: refs.maps.academicYearMap,
        subjectMap: refs.maps.subjectMap,
      }),
    [refs.maps],
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<EntityMap[R] | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [values, setValues] = useState<FormValues>(config.createValues());
  const pageSize = 8;

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return items;
    }

    return items.filter((item) =>
      config.searchKeys.some((key) =>
        String(((item as unknown as Record<string, unknown>)[key] ?? ""))
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [config.searchKeys, items, search]);

  const paginatedItems = useMemo(
    () => filteredItems.slice((page - 1) * pageSize, page * pageSize),
    [filteredItems, page],
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const columns = useMemo(() => {
    const base = config.columns(referenceBundle) as DataColumn<EntityMap[R]>[];
    const showFiles = ["notices", "routines", "syllabus", "questions", "resources"].includes(resource);
    const metaColumns: DataColumn<EntityMap[R]>[] = [
      {
        key: "updatedAt",
        label: "Updated",
        render: (row) => formatDate(row.updatedAt, true),
      },
    ];

    if (showFiles) {
      metaColumns.unshift(filesColumn<EntityMap[R] & { files?: UploadedFile[] }>() as DataColumn<EntityMap[R]>);
    }

    return [
      ...base,
      ...metaColumns,
      {
        key: "actions",
        label: "Actions",
        render: (row) => (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setEditing(row);
                setValues({
                  ...config.createValues(),
                  ...row,
                });
                setOpen(true);
              }}
            >
              Edit
            </Button>
            <Button variant="ghost" onClick={() => setConfirmId(row.id)}>
              Delete
            </Button>
          </div>
        ),
      },
    ];
  }, [config, referenceBundle, resource]);

  function openCreateModal() {
    setEditing(null);
    setValues(config.createValues());
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = normalizeValues(values) as Partial<EntityMap[R]>;
      if (editing) {
        await updateItem(editing.id, payload);
      } else {
        await createItem(payload);
      }
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirmId) {
      return;
    }

    setConfirming(true);
    try {
      await removeItem(confirmId);
      setConfirmId(null);
    } finally {
      setConfirming(false);
    }
  }

  if (loading || refs.loading) {
    return <LoadingState label={`Loading ${config.title.toLowerCase()}...`} />;
  }

  if (error || refs.error) {
    return <ErrorState message={error ?? refs.error ?? "Unknown error"} onRetry={refresh} />;
  }

  return (
    <div className="space-y-4">
      <section className="panel rounded-[28px] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              CRUD Management
            </p>
            <h1 className="heading-font mt-2 text-3xl font-bold">{config.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-soft)]">{config.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={`Search ${config.singularLabel}s`}
              className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-white px-4 py-3 text-sm outline-none sm:w-72"
            />
            <Button onClick={openCreateModal}>Add {config.singularLabel}</Button>
          </div>
        </div>
      </section>

      {filteredItems.length ? (
        <DataTable columns={columns} rows={paginatedItems} rowKey={(row) => row.id} />
      ) : (
        <EmptyState
          title={`No ${config.singularLabel}s yet`}
          description={`Create the first ${config.singularLabel} to start managing this section.`}
          action={<Button onClick={openCreateModal}>Add {config.singularLabel}</Button>}
        />
      )}

      <section className="panel rounded-[28px] px-4 py-3">
        <div className="flex flex-col gap-3 text-sm text-[var(--color-text-soft)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing <strong className="text-[var(--color-text)]">{paginatedItems.length}</strong> of{" "}
            <strong className="text-[var(--color-text)]">{filteredItems.length}</strong> records
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </Button>
            <Badge tone="info">
              Page {page} / {totalPages}
            </Badge>
            <Button
              variant="secondary"
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      <Modal
        open={open}
        title={`${editing ? "Edit" : "Add"} ${config.singularLabel}`}
        onClose={() => setOpen(false)}
      >
        <EntityForm
          fields={config.fields(referenceBundle) as FieldConfig[]}
          values={values}
          onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title={`Delete ${config.singularLabel}`}
        description={`This will permanently remove the selected ${config.singularLabel}.`}
        confirming={confirming}
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
