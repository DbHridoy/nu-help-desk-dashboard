"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/client";
import { formatBytes, formatDate, getFileUrl } from "@/lib/utils";
import type { UploadedFile } from "@/types";

export function FileUploadField({
  files,
  onChange,
}: {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploaded = await adminApi.upload(selected);
      onChange([...files, ...uploaded]);
      event.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeFile(id: string) {
    onChange(files.filter((file) => file.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="rounded-[28px] border border-dashed border-[var(--color-border-strong)] bg-stone-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">Upload PDF or image files</p>
            <p className="text-xs text-[var(--color-text-soft)]">
              Files are uploaded first, then attached to the current form.
            </p>
          </div>
          <label className="inline-flex cursor-pointer">
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,image/*"
              onChange={handleUpload}
            />
            <span className="rounded-2xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white">
              {uploading ? "Uploading..." : "Select files"}
            </span>
          </label>
        </div>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="font-semibold">{file.name}</div>
              <div className="text-xs text-[var(--color-text-soft)]">
                {formatBytes(file.size)} · {file.mimeType} · {formatDate(file.createdAt, true)}
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={getFileUrl(file.url)}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-[var(--color-border)] px-3 py-2 text-sm font-semibold"
              >
                Preview
              </a>
              <Button variant="ghost" onClick={() => removeFile(file.id)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
