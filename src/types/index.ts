export type EntityId = string;

export type ResourceType =
  | "notes"
  | "suggestions"
  | "short_questions"
  | "important_topics"
  | "model_questions";

export type StudentRequestStatus = "pending" | "completed" | "rejected";

export interface BaseEntity {
  id: EntityId;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: EntityId;
  name: string;
  email: string;
}

export interface UploadedFile {
  id: EntityId;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface Course extends BaseEntity {
  name: string;
  order: number;
  isActive: boolean;
}

export interface Department extends BaseEntity {
  name: string;
  course: EntityId;
  order: number;
  isActive: boolean;
}

export interface AcademicYear extends BaseEntity {
  name: string;
  order: number;
  isActive: boolean;
}

export interface Subject extends BaseEntity {
  course: EntityId;
  department: EntityId;
  academicYear: EntityId;
  title: string;
  code: string;
  isActive: boolean;
}

export interface Notice extends BaseEntity {
  title: string;
  category: string;
  course?: EntityId;
  department?: EntityId;
  academicYear?: EntityId;
  description: string;
  officialSourceLink: string;
  noticeDate: string;
  files: UploadedFile[];
  isVerified: boolean;
  isPublished: boolean;
}

export interface Routine extends BaseEntity {
  title: string;
  course: EntityId;
  department?: EntityId;
  academicYear: EntityId;
  examType: string;
  description: string;
  examStartDate: string;
  examEndDate: string;
  files: UploadedFile[];
  isVerified: boolean;
  isPublished: boolean;
}

export interface Syllabus extends BaseEntity {
  title: string;
  course: EntityId;
  department: EntityId;
  academicYear: EntityId;
  subject?: EntityId;
  subjectCode?: string;
  subjectTitle?: string;
  description: string;
  files: UploadedFile[];
  isVerified: boolean;
  isPublished: boolean;
}

export interface Question extends BaseEntity {
  title: string;
  course: EntityId;
  department: EntityId;
  academicYear: EntityId;
  subject: EntityId;
  examYear: string;
  description: string;
  files: UploadedFile[];
  isVerified: boolean;
  isPublished: boolean;
}

export interface Resource extends BaseEntity {
  title: string;
  resourceType: ResourceType;
  course: EntityId;
  department: EntityId;
  academicYear: EntityId;
  subject?: EntityId;
  description: string;
  files: UploadedFile[];
  isVerified: boolean;
  isPublished: boolean;
}

export interface StudentRequest extends BaseEntity {
  name?: string;
  course?: EntityId;
  department?: EntityId;
  academicYear?: EntityId;
  subject?: EntityId;
  whatTheyNeed: string;
  message: string;
  status: StudentRequestStatus;
}

export interface DashboardSummary {
  totalNotices: number;
  totalRoutines: number;
  totalSyllabusFiles: number;
  totalQuestions: number;
  totalResources: number;
  totalStudentRequests: number;
  recentResources: Resource[];
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type AdminResource =
  | "courses"
  | "departments"
  | "academic-years"
  | "subjects"
  | "notices"
  | "routines"
  | "syllabus"
  | "questions"
  | "resources"
  | "student-requests";

export interface MockDatabase {
  admin: AdminUser;
  courses: Course[];
  departments: Department[];
  academicYears: AcademicYear[];
  subjects: Subject[];
  notices: Notice[];
  routines: Routine[];
  syllabus: Syllabus[];
  questions: Question[];
  resources: Resource[];
  studentRequests: StudentRequest[];
  uploads: UploadedFile[];
}

export type EntityMap = {
  courses: Course;
  departments: Department;
  "academic-years": AcademicYear;
  subjects: Subject;
  notices: Notice;
  routines: Routine;
  syllabus: Syllabus;
  questions: Question;
  resources: Resource;
  "student-requests": StudentRequest;
};
