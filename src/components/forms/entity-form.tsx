"use client";

import type { FormEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileUploadField } from "@/components/forms/file-upload-field";
import type { UploadedFile } from "@/types";

export type FormValues = Record<string, string | boolean | number | UploadedFile[]>;

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "date" | "number" | "files";
  required?: boolean;
  placeholder?: string;
  options?: (values: FormValues) => SelectOption[];
  hint?: string;
}

export function EntityForm({
  fields,
  values,
  onChange,
  onSubmit,
  submitting,
}: {
  fields: FieldConfig[];
  values: FormValues;
  onChange: (name: string, value: FormValues[string]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
}) {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const value = values[field.name];

          if (field.type === "textarea") {
            return (
              <div key={field.name} className="md:col-span-2">
                <Textarea
                  id={field.name}
                  label={field.label}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={String(value ?? "")}
                  onChange={(event) => onChange(field.name, event.target.value)}
                />
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <Select
                key={field.name}
                id={field.name}
                label={field.label}
                value={String(value ?? "")}
                options={field.options?.(values) ?? []}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            );
          }

          if (field.type === "checkbox") {
            return (
              <Checkbox
                key={field.name}
                label={field.label}
                hint={field.hint}
                checked={Boolean(value)}
                onChange={(event) => onChange(field.name, event.target.checked)}
              />
            );
          }

          if (field.type === "files") {
            return (
              <div key={field.name} className="md:col-span-2">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[var(--color-text-soft)]">{field.label}</p>
                  <FileUploadField
                    files={Array.isArray(value) ? (value as UploadedFile[]) : []}
                    onChange={(files) => onChange(field.name, files)}
                  />
                </div>
              </div>
            );
          }

          return (
            <Input
              key={field.name}
              id={field.name}
              type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
              label={field.label}
              hint={field.hint}
              placeholder={field.placeholder}
              required={field.required}
              value={String(value ?? "")}
              onChange={(event) =>
                onChange(
                  field.name,
                  field.type === "number" ? Number(event.target.value) : event.target.value,
                )
              }
            />
          );
        })}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
