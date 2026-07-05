import { API_BASE_URL } from "@/lib/env";
import type {
  AcademicYear,
  AdminUser,
  Course,
  DashboardSummary,
  Department,
  EntityMap,
  LoginResponse,
  Resource,
  StudentRequest,
  Subject,
  UploadedFile,
} from "@/types";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type MaybeRecord = Record<string, unknown>;

function isRecord(value: unknown): value is MaybeRecord {
  return Boolean(value) && typeof value === "object";
}

function getId(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (isRecord(value)) {
    if (typeof value.id === "string") {
      return value.id;
    }

    if (typeof value._id === "string") {
      return value._id;
    }
  }

  return "";
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function getFileUrl(fileUrlOrPath?: string): string {
  if (!fileUrlOrPath) {
    return "";
  }

  if (/^https?:\/\//i.test(fileUrlOrPath)) {
    return fileUrlOrPath;
  }

  return `${API_BASE_URL.replace(/\/api$/, "")}${fileUrlOrPath.startsWith("/") ? "" : "/"}${fileUrlOrPath}`;
}

function normalizeUploadedFile(input: unknown): UploadedFile {
  const source = isRecord(input) ? input : {};
  const url = getString(source.url) || getString(source.path);

  return {
    id: getId(source),
    name: getString(source.originalName) || getString(source.name) || getString(source.filename),
    url: getFileUrl(url),
    mimeType: getString(source.mimeType),
    size: typeof source.size === "number" ? source.size : 0,
    createdAt: getString(source.createdAt),
  };
}

function normalizeFiles(input: unknown): UploadedFile[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map(normalizeUploadedFile).filter((file) => Boolean(file.id));
}

function extractRelationId(source: MaybeRecord, key: string): string {
  return getId(source[key]) || getString(source[key]);
}

function normalizeAdmin(input: unknown): AdminUser {
  const source = isRecord(input) ? input : {};

  return {
    id: getId(source),
    name: getString(source.name),
    email: getString(source.email),
  };
}

export function normalizeLoginResponse(input: unknown): LoginResponse {
  const source = isRecord(input) ? input : {};

  return {
    token: getString(source.token),
    admin: normalizeAdmin(source.admin),
  };
}

export function normalizeCourse(input: unknown): Course {
  const source = isRecord(input) ? input : {};

  return {
    id: getId(source),
    createdAt: getString(source.createdAt),
    updatedAt: getString(source.updatedAt),
    name: getString(source.name),
    order: typeof source.order === "number" ? source.order : 0,
    isActive: Boolean(source.isActive),
  };
}

export function normalizeDepartment(input: unknown): Department {
  const source = isRecord(input) ? input : {};

  return {
    id: getId(source),
    createdAt: getString(source.createdAt),
    updatedAt: getString(source.updatedAt),
    name: getString(source.name),
    course: extractRelationId(source, "courseId"),
    order: typeof source.order === "number" ? source.order : 0,
    isActive: Boolean(source.isActive),
  };
}

export function normalizeAcademicYear(input: unknown): AcademicYear {
  const source = isRecord(input) ? input : {};

  return {
    id: getId(source),
    createdAt: getString(source.createdAt),
    updatedAt: getString(source.updatedAt),
    name: getString(source.name),
    order: typeof source.order === "number" ? source.order : 0,
    isActive: Boolean(source.isActive),
  };
}

export function normalizeSubject(input: unknown): Subject {
  const source = isRecord(input) ? input : {};

  return {
    id: getId(source),
    createdAt: getString(source.createdAt),
    updatedAt: getString(source.updatedAt),
    course: extractRelationId(source, "courseId"),
    department: extractRelationId(source, "departmentId"),
    academicYear: extractRelationId(source, "academicYearId"),
    title: getString(source.title),
    code: getString(source.code),
    isActive: Boolean(source.isActive),
  };
}

function normalizeManagedEntity<T extends { id: string }>(
  input: unknown,
  fields: Partial<T>,
): T {
  const source = isRecord(input) ? input : {};

  return {
    id: getId(source),
    createdAt: getString(source.createdAt),
    updatedAt: getString(source.updatedAt),
    files: normalizeFiles(source.fileIds ?? source.files),
    ...fields,
  } as unknown as T;
}

export function normalizeNotice(input: unknown): EntityMap["notices"] {
  const source = isRecord(input) ? input : {};

  return normalizeManagedEntity<EntityMap["notices"]>(source, {
    title: getString(source.title),
    category: getString(source.category),
    course: extractRelationId(source, "courseId") || undefined,
    department: extractRelationId(source, "departmentId") || undefined,
    academicYear: extractRelationId(source, "academicYearId") || undefined,
    description: getString(source.description),
    officialSourceLink: getString(source.officialSourceLink),
    noticeDate: getString(source.noticeDate),
    isVerified: Boolean(source.isVerified),
    isPublished: Boolean(source.isPublished),
  });
}

export function normalizeRoutine(input: unknown): EntityMap["routines"] {
  const source = isRecord(input) ? input : {};

  return normalizeManagedEntity<EntityMap["routines"]>(source, {
    title: getString(source.title),
    course: extractRelationId(source, "courseId"),
    department: extractRelationId(source, "departmentId") || undefined,
    academicYear: extractRelationId(source, "academicYearId"),
    examType: getString(source.examType),
    description: getString(source.description),
    examStartDate: getString(source.examStartDate),
    examEndDate: getString(source.examEndDate),
    isVerified: Boolean(source.isVerified),
    isPublished: Boolean(source.isPublished),
  });
}

export function normalizeSyllabus(input: unknown): EntityMap["syllabus"] {
  const source = isRecord(input) ? input : {};

  return normalizeManagedEntity<EntityMap["syllabus"]>(source, {
    title: getString(source.title),
    course: extractRelationId(source, "courseId"),
    department: extractRelationId(source, "departmentId"),
    academicYear: extractRelationId(source, "academicYearId"),
    subject: extractRelationId(source, "subjectId") || undefined,
    subjectCode: getString(source.subjectCode) || undefined,
    subjectTitle: getString(source.subjectTitle) || undefined,
    description: getString(source.description),
    isVerified: Boolean(source.isVerified),
    isPublished: Boolean(source.isPublished),
  });
}

export function normalizeQuestion(input: unknown): EntityMap["questions"] {
  const source = isRecord(input) ? input : {};

  return normalizeManagedEntity<EntityMap["questions"]>(source, {
    title: getString(source.title),
    course: extractRelationId(source, "courseId"),
    department: extractRelationId(source, "departmentId"),
    academicYear: extractRelationId(source, "academicYearId"),
    subject: extractRelationId(source, "subjectId"),
    examYear: String(source.examYear ?? ""),
    description: getString(source.description),
    isVerified: Boolean(source.isVerified),
    isPublished: Boolean(source.isPublished),
  });
}

export function normalizeResource(input: unknown): Resource {
  const source = isRecord(input) ? input : {};

  return normalizeManagedEntity<Resource>(source, {
    title: getString(source.title),
    resourceType: getString(source.resourceType) as Resource["resourceType"],
    course: extractRelationId(source, "courseId"),
    department: extractRelationId(source, "departmentId"),
    academicYear: extractRelationId(source, "academicYearId"),
    subject: extractRelationId(source, "subjectId") || undefined,
    description: getString(source.description),
    isVerified: Boolean(source.isVerified),
    isPublished: Boolean(source.isPublished),
  });
}

export function normalizeStudentRequest(input: unknown): StudentRequest {
  const source = isRecord(input) ? input : {};

  return {
    id: getId(source),
    createdAt: getString(source.createdAt),
    updatedAt: getString(source.updatedAt),
    name: getString(source.name) || undefined,
    course: extractRelationId(source, "courseId") || undefined,
    department: extractRelationId(source, "departmentId") || undefined,
    academicYear: extractRelationId(source, "academicYearId") || undefined,
    subject: extractRelationId(source, "subjectId") || undefined,
    whatTheyNeed: getString(source.whatTheyNeed),
    message: getString(source.message),
    status: getString(source.status) as StudentRequest["status"],
  };
}

export function normalizeDashboardSummary(input: unknown): DashboardSummary {
  const source = isRecord(input) ? input : {};
  const recentResources = Array.isArray(source.recentResources) ? source.recentResources : [];

  return {
    totalNotices: Number(source.notices ?? 0),
    totalRoutines: Number(source.routines ?? 0),
    totalSyllabusFiles: Number(source.syllabus ?? 0),
    totalQuestions: Number(source.questions ?? 0),
    totalResources: Number(source.resources ?? 0),
    totalStudentRequests: Number(source.totalStudentRequests ?? source.pendingStudentRequests ?? 0),
    recentResources: recentResources.map(normalizeResource),
  };
}

export function unwrapEnvelope<T>(payload: unknown): T {
  if (isRecord(payload) && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export function normalizeEntity<R extends keyof EntityMap>(resource: R, input: unknown): EntityMap[R] {
  switch (resource) {
    case "courses":
      return normalizeCourse(input) as EntityMap[R];
    case "departments":
      return normalizeDepartment(input) as EntityMap[R];
    case "academic-years":
      return normalizeAcademicYear(input) as EntityMap[R];
    case "subjects":
      return normalizeSubject(input) as EntityMap[R];
    case "notices":
      return normalizeNotice(input) as EntityMap[R];
    case "routines":
      return normalizeRoutine(input) as EntityMap[R];
    case "syllabus":
      return normalizeSyllabus(input) as EntityMap[R];
    case "questions":
      return normalizeQuestion(input) as EntityMap[R];
    case "resources":
      return normalizeResource(input) as EntityMap[R];
    case "student-requests":
      return normalizeStudentRequest(input) as EntityMap[R];
    default:
      throw new Error(`Unsupported resource: ${resource as string}`);
  }
}

export function toBackendPayload<R extends keyof EntityMap>(
  resource: R,
  payload: Partial<EntityMap[R]>,
): Record<string, unknown> {
  const source = payload as Record<string, unknown>;
  const common = {
    title: source.title,
    slug: source.slug,
    description: source.description,
    isVerified: source.isVerified,
    isPublished: source.isPublished,
    fileIds: Array.isArray(source.files) ? source.files.map((file) => getId(file)) : undefined,
  };

  switch (resource) {
    case "courses":
      return {
        name: source.name,
        order: source.order,
        isActive: source.isActive,
      };
    case "departments":
      return {
        name: source.name,
        courseId: source.course,
        order: source.order,
        isActive: source.isActive,
      };
    case "academic-years":
      return {
        name: source.name,
        order: source.order,
        isActive: source.isActive,
      };
    case "subjects":
      return {
        courseId: source.course,
        departmentId: source.department,
        academicYearId: source.academicYear,
        title: source.title,
        code: source.code,
        isActive: source.isActive,
      };
    case "notices":
      return {
        ...common,
        category: source.category,
        courseId: source.course,
        departmentId: source.department,
        academicYearId: source.academicYear,
        officialSourceLink: source.officialSourceLink,
        noticeDate: source.noticeDate,
      };
    case "routines":
      return {
        ...common,
        courseId: source.course,
        departmentId: source.department,
        academicYearId: source.academicYear,
        examType: source.examType,
        examStartDate: source.examStartDate,
        examEndDate: source.examEndDate,
      };
    case "syllabus":
      return {
        ...common,
        courseId: source.course,
        departmentId: source.department,
        academicYearId: source.academicYear,
        subjectId: source.subject,
        subjectCode: source.subjectCode,
        subjectTitle: source.subjectTitle,
      };
    case "questions":
      return {
        ...common,
        courseId: source.course,
        departmentId: source.department,
        academicYearId: source.academicYear,
        subjectId: source.subject,
        examYear: source.examYear,
      };
    case "resources":
      return {
        ...common,
        resourceType: source.resourceType,
        courseId: source.course,
        departmentId: source.department,
        academicYearId: source.academicYear,
        subjectId: source.subject,
      };
    case "student-requests":
      return {
        name: source.name,
        courseId: source.course,
        departmentId: source.department,
        academicYearId: source.academicYear,
        subjectId: source.subject,
        whatTheyNeed: source.whatTheyNeed,
        message: source.message,
        status: source.status,
      };
    default:
      return source;
  }
}
