import { mockDatabaseSeed } from "@/lib/mock/data";
import { toSlug } from "@/lib/utils";
import type {
  AdminResource,
  DashboardSummary,
  EntityMap,
  LoginResponse,
  MockDatabase,
  Resource,
  StudentRequest,
  StudentRequestStatus,
  UploadedFile,
} from "@/types";

const STORAGE_KEY = "nu-admin-mock-db-v1";
const MOCK_TOKEN = "mock-admin-token";
const resourceKeyMap = {
  courses: "courses",
  departments: "departments",
  "academic-years": "academicYears",
  subjects: "subjects",
  notices: "notices",
  routines: "routines",
  syllabus: "syllabus",
  questions: "questions",
  resources: "resources",
  "student-requests": "studentRequests",
} as const;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readDb(): MockDatabase {
  if (!isBrowser()) {
    return clone(mockDatabaseSeed);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDatabaseSeed));
    return clone(mockDatabaseSeed);
  }

  try {
    return JSON.parse(raw) as MockDatabase;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDatabaseSeed));
    return clone(mockDatabaseSeed);
  }
}

function writeDb(db: MockDatabase) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function delay() {
  return new Promise((resolve) => window.setTimeout(resolve, 250));
}

function listFor<R extends AdminResource>(db: MockDatabase, resource: R): EntityMap[R][] {
  const key = resourceKeyMap[resource];
  return clone(db[key]) as EntityMap[R][];
}

function saveList<R extends AdminResource>(db: MockDatabase, resource: R, value: EntityMap[R][]) {
  const key = resourceKeyMap[resource];
  db[key] = clone(value) as MockDatabase[typeof key];
}

function toDashboardSummary(db: MockDatabase): DashboardSummary {
  const recentResources = [...db.resources]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 5);

  return {
    totalNotices: db.notices.length,
    totalRoutines: db.routines.length,
    totalSyllabusFiles: db.syllabus.length,
    totalQuestions: db.questions.length,
    totalResources: db.resources.length,
    totalStudentRequests: db.studentRequests.length,
    recentResources,
  };
}

function materializeFiles(input: unknown): UploadedFile[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.filter(
    (item): item is UploadedFile =>
      Boolean(item && typeof item === "object" && "id" in item && "name" in item && "url" in item),
  );
}

export const mockApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    await delay();

    if (email !== "admin@nuhelp.local" || password !== "password123") {
      throw new Error("Invalid mock credentials. Use admin@nuhelp.local / password123");
    }

    return {
      token: MOCK_TOKEN,
      admin: clone(mockDatabaseSeed.admin),
    };
  },

  async me() {
    await delay();
    return clone(mockDatabaseSeed.admin);
  },

  async dashboard() {
    await delay();
    return toDashboardSummary(readDb());
  },

  async list<R extends AdminResource>(resource: R): Promise<EntityMap[R][]> {
    await delay();
    return listFor(readDb(), resource);
  },

  async create<R extends AdminResource>(
    resource: R,
    payload: Partial<EntityMap[R]>,
  ): Promise<EntityMap[R]> {
    await delay();
    const db = readDb();
    const list = listFor(db, resource);
    const now = new Date().toISOString();
    const payloadWithFiles = payload as { files?: unknown };
    const item = {
      ...payload,
      id: toSlug(resource.slice(0, 3)),
      createdAt: now,
      updatedAt: now,
      files: materializeFiles(payloadWithFiles.files),
    } as EntityMap[R];

    list.unshift(item);
    saveList(db, resource, list);
    writeDb(db);
    return clone(item);
  },

  async update<R extends AdminResource>(
    resource: R,
    id: string,
    payload: Partial<EntityMap[R]>,
  ): Promise<EntityMap[R]> {
    await delay();
    const db = readDb();
    const list = listFor(db, resource);
    const index = list.findIndex((item) => item.id === id);

    if (index < 0) {
      throw new Error("Item not found");
    }

    const payloadWithFiles = payload as { files?: unknown };
    const currentItemWithFiles = list[index] as { files?: UploadedFile[] };
    const updated = {
      ...list[index],
      ...payload,
      files: payloadWithFiles.files
        ? materializeFiles(payloadWithFiles.files)
        : currentItemWithFiles.files,
      updatedAt: new Date().toISOString(),
    } as EntityMap[R];

    list[index] = updated;
    saveList(db, resource, list);
    writeDb(db);
    return clone(updated);
  },

  async remove(resource: AdminResource, id: string) {
    await delay();
    const db = readDb();
    const list = listFor(db, resource).filter((item) => item.id !== id);
    saveList(db, resource, list);
    writeDb(db);
  },

  async updateStudentRequestStatus(id: string, status: StudentRequestStatus): Promise<StudentRequest> {
    return this.update("student-requests", id, { status });
  },

  async upload(files: File[]) {
    await delay();
    const db = readDb();

    const uploaded = files.map((file) => ({
      id: toSlug("file"),
      name: file.name,
      url: "#",
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      createdAt: new Date().toISOString(),
    }));

    db.uploads = [...uploaded, ...db.uploads];
    writeDb(db);
    return uploaded;
  },

  async listUploads() {
    await delay();
    return clone(readDb().uploads);
  },

  async recentResources(): Promise<Resource[]> {
    await delay();
    return clone(readDb().resources).slice(0, 5);
  },
};
