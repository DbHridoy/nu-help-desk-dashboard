import { getStoredToken } from "@/lib/auth";
import { API_BASE_URL, USE_MOCKS } from "@/lib/env";
import { mockApi } from "@/lib/mock/service";
import { normalizeFiles } from "@/lib/utils";
import type {
  AdminResource,
  DashboardSummary,
  EntityMap,
  LoginResponse,
  StudentRequest,
  StudentRequestStatus,
  UploadedFile,
} from "@/types";

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

  const payload = (await response.json()) as T | { data?: T };
  if (payload && typeof payload === "object" && "data" in payload && payload.data) {
    return payload.data;
  }

  return payload as T;
}

function normalizeListResponse<T>(payload: T[] | { items?: T[]; data?: T[] }) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.items ?? payload.data ?? [];
}

function coerceEntity<T extends { files?: unknown }>(entity: T): T {
  if (!entity || typeof entity !== "object") {
    return entity;
  }

  if ("files" in entity) {
    return {
      ...entity,
      files: normalizeFiles(entity.files),
    };
  }

  return entity;
}

export const adminApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    if (USE_MOCKS) {
      return mockApi.login(email, password);
    }

    return request<LoginResponse>("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async me() {
    if (USE_MOCKS) {
      return mockApi.me();
    }

    return request("/admin/me");
  },

  async getDashboard(): Promise<DashboardSummary> {
    if (USE_MOCKS) {
      return mockApi.dashboard();
    }

    return request<DashboardSummary>("/admin/dashboard");
  },

  async list<R extends AdminResource>(resource: R): Promise<EntityMap[R][]> {
    if (USE_MOCKS) {
      return mockApi.list(resource);
    }

    const payload = await request<EntityMap[R][] | { items?: EntityMap[R][]; data?: EntityMap[R][] }>(
      `/admin/${resource}`,
    );
    return normalizeListResponse(payload).map((item) =>
      coerceEntity(item as { files?: unknown }),
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
      body: JSON.stringify(payload),
    });
    return coerceEntity(created as { files?: unknown }) as EntityMap[R];
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
      body: JSON.stringify(payload),
    });
    return coerceEntity(updated as { files?: unknown }) as EntityMap[R];
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

    return request<StudentRequest>(`/admin/student-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
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

    const payload = (await response.json()) as UploadedFile[] | { data?: UploadedFile[] };
    return Array.isArray(payload) ? payload : payload.data ?? [];
  },

  async listUploads(): Promise<UploadedFile[]> {
    if (USE_MOCKS) {
      return mockApi.listUploads();
    }

    const payload = await request<UploadedFile[] | { items?: UploadedFile[]; data?: UploadedFile[] }>(
      "/admin/uploads",
    );
    return normalizeListResponse(payload);
  },
};
