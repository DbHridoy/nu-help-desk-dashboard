import { getStoredToken } from "@/lib/auth";
import { API_BASE_URL, USE_MOCKS } from "@/lib/env";
import { mockApi } from "@/lib/mock/service";
import type {
  AdminResource,
  DashboardSummary,
  EntityMap,
  LoginResponse,
  StudentRequest,
  StudentRequestStatus,
  UploadedFile,
} from "@/types";
import {
  getFileUrl,
  normalizeDashboardSummary,
  normalizeEntity,
  normalizeLoginResponse,
  normalizeStudentRequest,
  unwrapEnvelope,
  toBackendPayload,
} from "@/lib/api/normalize";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);

  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const errorPayload = (await response.json()) as { message?: string };
      message = errorPayload.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function normalizeListResponse<T>(payload: T[] | { items?: T[]; data?: T[] }) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.items ?? payload.data ?? [];
}

export const adminApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    if (USE_MOCKS) {
      return mockApi.login(email, password);
    }

    const payload = await request("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return normalizeLoginResponse(unwrapEnvelope(payload));
  },

  async me() {
    if (USE_MOCKS) {
      return mockApi.me();
    }

    const payload = await request("/admin/me");
    return unwrapEnvelope(payload);
  },

  async getDashboard(): Promise<DashboardSummary> {
    if (USE_MOCKS) {
      return mockApi.dashboard();
    }

    const payload = await request("/admin/dashboard");
    return normalizeDashboardSummary(unwrapEnvelope(payload));
  },

  async list<R extends AdminResource>(resource: R): Promise<EntityMap[R][]> {
    if (USE_MOCKS) {
      return mockApi.list(resource);
    }

    const payload = await request<EntityMap[R][] | { items?: EntityMap[R][]; data?: EntityMap[R][] }>(
      `/admin/${resource}`,
    );
    return normalizeListResponse(unwrapEnvelope(payload) ?? []).map((item) =>
      normalizeEntity(resource, item),
    ) as EntityMap[R][];
  },

  async create<R extends AdminResource>(
    resource: R,
    payload: Partial<EntityMap[R]>,
  ): Promise<EntityMap[R]> {
    if (USE_MOCKS) {
      return mockApi.create(resource, payload);
    }

    const created = await request<EntityMap[R]>(`/admin/${resource}`, {
      method: "POST",
      body: JSON.stringify(toBackendPayload(resource, payload)),
    });
    return normalizeEntity(resource, unwrapEnvelope(created));
  },

  async update<R extends AdminResource>(
    resource: R,
    id: string,
    payload: Partial<EntityMap[R]>,
  ): Promise<EntityMap[R]> {
    if (USE_MOCKS) {
      return mockApi.update(resource, id, payload);
    }

    const updated = await request<EntityMap[R]>(`/admin/${resource}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(toBackendPayload(resource, payload)),
    });
    return normalizeEntity(resource, unwrapEnvelope(updated));
  },

  async remove(resource: AdminResource, id: string) {
    if (USE_MOCKS) {
      return mockApi.remove(resource, id);
    }

    return request<void>(`/admin/${resource}/${id}`, {
      method: "DELETE",
    });
  },

  async updateStudentRequestStatus(id: string, status: StudentRequestStatus): Promise<StudentRequest> {
    if (USE_MOCKS) {
      return mockApi.updateStudentRequestStatus(id, status);
    }

    const payload = await request(`/admin/student-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return normalizeStudentRequest(unwrapEnvelope(payload));
  },

  async upload(files: File[]): Promise<UploadedFile[]> {
    if (USE_MOCKS) {
      return mockApi.upload(files);
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/admin/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const payload = await response.json();
    const uploadedFiles = unwrapEnvelope(payload);
    return Array.isArray(uploadedFiles)
      ? uploadedFiles.map((file) => ({
          ...file,
          url: getFileUrl((file as UploadedFile).url),
        }))
      : [];
  },

  async listUploads(): Promise<UploadedFile[]> {
    if (USE_MOCKS) {
      return mockApi.listUploads();
    }

    const payload = await request<UploadedFile[] | { items?: UploadedFile[]; data?: UploadedFile[] }>(
      "/admin/uploads",
    );
    return normalizeListResponse(unwrapEnvelope<unknown[]>(payload) ?? []).map((file) => ({
      ...(file as UploadedFile),
      url: getFileUrl((file as UploadedFile).url),
      name:
        (file as UploadedFile & { originalName?: string; filename?: string }).name ||
        (file as UploadedFile & { originalName?: string }).originalName ||
        (file as UploadedFile & { filename?: string }).filename ||
        "",
    }));
  },
};
