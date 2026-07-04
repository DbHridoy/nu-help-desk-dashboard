"use client";

import { useEffect, useState } from "react";
import { FileUploadField } from "@/components/forms/file-upload-field";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state-panels";
import { adminApi } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import type { UploadedFile } from "@/types";

export function UploadsPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUploads() {
      setLoading(true);
      setError(null);

      try {
        const data = await adminApi.listUploads();
        setFiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load uploads");
      } finally {
        setLoading(false);
      }
    }

    void loadUploads();
  }, []);

  if (loading) {
    return <LoadingState label="Loading uploads..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <section className="panel rounded-[28px] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Upload Center
        </p>
        <h1 className="heading-font mt-2 text-3xl font-bold">Upload files before attaching them to content</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-soft)]">
          This utility page is useful when the admin wants to prepare files before creating notices, routines, syllabus
          items, questions, or resources.
        </p>
      </section>

      <section className="panel rounded-[28px] p-6">
        <FileUploadField files={files} onChange={setFiles} />
      </section>

      {files.length ? (
        <section className="panel rounded-[28px] p-6">
          <h2 className="heading-font text-2xl font-bold">Uploaded files</h2>
          <div className="mt-5 space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3"
              >
                <div className="font-semibold">{file.name}</div>
                <div className="mt-1 text-xs text-[var(--color-text-soft)]">
                  Uploaded {formatDate(file.createdAt, true)}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState title="No uploaded files" description="Uploaded files will appear here for quick review." />
      )}
    </div>
  );
}
