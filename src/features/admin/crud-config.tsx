import { Badge } from "@/components/ui/badge";
import type { DataColumn } from "@/components/ui/data-table";
import type { FieldConfig, FormValues } from "@/components/forms/entity-form";
import type {
  AcademicYear,
  AdminResource,
  Course,
  Department,
  Notice,
  Question,
  Resource,
  Routine,
  Subject,
  Syllabus,
} from "@/types";

export interface ReferenceBundle {
  courseOptions: { label: string; value: string }[];
  departmentOptions: { label: string; value: string }[];
  academicYearOptions: { label: string; value: string }[];
  subjectOptions: { label: string; value: string }[];
  courseMap: Record<string, string>;
  departmentMap: Record<string, string>;
  academicYearMap: Record<string, string>;
  subjectMap: Record<string, string>;
}

export interface CrudConfig<T> {
  title: string;
  description: string;
  resource: AdminResource;
  singularLabel: string;
  searchKeys: string[];
  createValues: () => FormValues;
  fields: (refs: ReferenceBundle) => FieldConfig[];
  columns: (refs: ReferenceBundle) => DataColumn<T>[];
  toPayload?: (values: FormValues) => Partial<T>;
}

function commonStatusColumns<T extends { isVerified: boolean; isPublished: boolean }>() {
  return [
    {
      key: "verified",
      label: "Verified",
      render: (row: T) =>
        row.isVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="warning">Pending</Badge>,
    },
    {
      key: "published",
      label: "Publish",
      render: (row: T) =>
        row.isPublished ? <Badge tone="info">Published</Badge> : <Badge>Draft</Badge>,
    },
  ];
}

export function createReferenceBundle(input: {
  courseMap: Record<string, string>;
  departmentMap: Record<string, string>;
  academicYearMap: Record<string, string>;
  subjectMap: Record<string, string>;
}) {
  return {
    ...input,
    courseOptions: Object.entries(input.courseMap).map(([value, label]) => ({ value, label })),
    departmentOptions: Object.entries(input.departmentMap).map(([value, label]) => ({ value, label })),
    academicYearOptions: Object.entries(input.academicYearMap).map(([value, label]) => ({ value, label })),
    subjectOptions: Object.entries(input.subjectMap).map(([value, label]) => ({ value, label })),
  };
}

export const crudConfigs = {
  courses: {
    title: "Courses",
    description: "Manage the course catalog order and activation state.",
    resource: "courses",
    singularLabel: "course",
    searchKeys: ["name"],
    createValues: () => ({ name: "", order: 1, isActive: true }),
    fields: () => [
      { name: "name", label: "Course name", type: "text", required: true },
      { name: "order", label: "Display order", type: "number", required: true },
      { name: "isActive", label: "Active", type: "checkbox", hint: "Inactive courses stay hidden." },
    ],
    columns: (): DataColumn<Course>[] => [
      { key: "name", label: "Name", render: (row) => <span className="font-semibold">{(row as Course).name}</span> },
      { key: "order", label: "Order", render: (row) => (row as Course).order },
      {
        key: "status",
        label: "Status",
        render: (row) =>
          (row as Course).isActive ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>,
      },
    ],
  },
  departments: {
    title: "Departments",
    description: "Map departments under a course and keep the public ordering stable.",
    resource: "departments",
    singularLabel: "department",
    searchKeys: ["name"],
    createValues: () => ({ name: "", course: "", order: 1, isActive: true }),
    fields: (refs: ReferenceBundle) => [
      { name: "name", label: "Department name", type: "text", required: true },
      { name: "course", label: "Course", type: "select", options: () => refs.courseOptions, required: true },
      { name: "order", label: "Display order", type: "number", required: true },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
    columns: (refs: ReferenceBundle): DataColumn<Department>[] => [
      { key: "name", label: "Name", render: (row) => <span className="font-semibold">{(row as Department).name}</span> },
      {
        key: "course",
        label: "Course",
        render: (row) => refs.courseMap[(row as Department).course] ?? "-",
      },
      { key: "order", label: "Order", render: (row) => (row as Department).order },
      {
        key: "status",
        label: "Status",
        render: (row) =>
          (row as Department).isActive ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>,
      },
    ],
  },
  "academic-years": {
    title: "Academic Years",
    description: "Keep year labels consistent for filters and content classification.",
    resource: "academic-years",
    singularLabel: "academic year",
    searchKeys: ["name"],
    createValues: () => ({ name: "", order: 1, isActive: true }),
    fields: () => [
      { name: "name", label: "Year label", type: "text", required: true },
      { name: "order", label: "Display order", type: "number", required: true },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
    columns: (): DataColumn<AcademicYear>[] => [
      {
        key: "name",
        label: "Name",
        render: (row) => <span className="font-semibold">{(row as AcademicYear).name}</span>,
      },
      { key: "order", label: "Order", render: (row) => (row as AcademicYear).order },
      {
        key: "status",
        label: "Status",
        render: (row) =>
          (row as AcademicYear).isActive ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>,
      },
    ],
  },
  subjects: {
    title: "Subjects",
    description: "Maintain subject mappings for course, department, and academic year.",
    resource: "subjects",
    singularLabel: "subject",
    searchKeys: ["title", "code"],
    createValues: () => ({
      course: "",
      department: "",
      academicYear: "",
      title: "",
      code: "",
      isActive: true,
    }),
    fields: (refs: ReferenceBundle) => [
      { name: "course", label: "Course", type: "select", options: () => refs.courseOptions, required: true },
      {
        name: "department",
        label: "Department",
        type: "select",
        options: () => refs.departmentOptions,
        required: true,
      },
      {
        name: "academicYear",
        label: "Academic year",
        type: "select",
        options: () => refs.academicYearOptions,
        required: true,
      },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "code", label: "Code", type: "text", required: true },
      { name: "isActive", label: "Active", type: "checkbox" },
    ],
    columns: (refs: ReferenceBundle): DataColumn<Subject>[] => [
      {
        key: "subject",
        label: "Subject",
        render: (row) => (
          <div>
            <div className="font-semibold">{(row as Subject).title}</div>
            <div className="text-xs text-[var(--color-text-soft)]">{(row as Subject).code}</div>
          </div>
        ),
      },
      { key: "course", label: "Course", render: (row) => refs.courseMap[(row as Subject).course] ?? "-" },
      {
        key: "department",
        label: "Department",
        render: (row) => refs.departmentMap[(row as Subject).department] ?? "-",
      },
      {
        key: "year",
        label: "Year",
        render: (row) => refs.academicYearMap[(row as Subject).academicYear] ?? "-",
      },
      {
        key: "status",
        label: "Status",
        render: (row) =>
          (row as Subject).isActive ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>,
      },
    ],
  },
  notices: {
    title: "Notices",
    description: "Publish verified academic notices with context filters and source links.",
    resource: "notices",
    singularLabel: "notice",
    searchKeys: ["title", "category", "description"],
    createValues: () => ({
      title: "",
      category: "",
      course: "",
      department: "",
      academicYear: "",
      description: "",
      officialSourceLink: "",
      noticeDate: "",
      files: [],
      isVerified: false,
      isPublished: false,
    }),
    fields: (refs: ReferenceBundle) => [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "text", required: true },
      { name: "course", label: "Course", type: "select", options: () => refs.courseOptions },
      { name: "department", label: "Department", type: "select", options: () => refs.departmentOptions },
      { name: "academicYear", label: "Academic year", type: "select", options: () => refs.academicYearOptions },
      { name: "noticeDate", label: "Notice date", type: "date", required: true },
      { name: "officialSourceLink", label: "Official source link", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "files", label: "Files", type: "files" },
      { name: "isVerified", label: "Verified", type: "checkbox" },
      { name: "isPublished", label: "Published", type: "checkbox" },
    ],
    columns: (): DataColumn<Notice>[] => [
      {
        key: "title",
        label: "Notice",
        render: (row) => (
          <div>
            <div className="font-semibold">{(row as Notice).title}</div>
            <div className="text-xs text-[var(--color-text-soft)]">{(row as Notice).category}</div>
          </div>
        ),
      },
      ...commonStatusColumns<Notice>(),
    ],
  },
  routines: {
    title: "Routines",
    description: "Manage exam routines by course, year, and date range.",
    resource: "routines",
    singularLabel: "routine",
    searchKeys: ["title", "examType", "description"],
    createValues: () => ({
      title: "",
      course: "",
      department: "",
      academicYear: "",
      examType: "",
      description: "",
      examStartDate: "",
      examEndDate: "",
      files: [],
      isVerified: false,
      isPublished: false,
    }),
    fields: (refs: ReferenceBundle) => [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "course", label: "Course", type: "select", options: () => refs.courseOptions, required: true },
      { name: "department", label: "Department", type: "select", options: () => refs.departmentOptions },
      {
        name: "academicYear",
        label: "Academic year",
        type: "select",
        options: () => refs.academicYearOptions,
        required: true,
      },
      { name: "examType", label: "Exam type", type: "text", required: true },
      { name: "examStartDate", label: "Start date", type: "date", required: true },
      { name: "examEndDate", label: "End date", type: "date", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "files", label: "Files", type: "files" },
      { name: "isVerified", label: "Verified", type: "checkbox" },
      { name: "isPublished", label: "Published", type: "checkbox" },
    ],
    columns: (refs: ReferenceBundle): DataColumn<Routine>[] => [
      {
        key: "title",
        label: "Routine",
        render: (row) => (
          <div>
            <div className="font-semibold">{(row as Routine).title}</div>
            <div className="text-xs text-[var(--color-text-soft)]">{(row as Routine).examType}</div>
          </div>
        ),
      },
      { key: "course", label: "Course", render: (row) => refs.courseMap[(row as Routine).course] ?? "-" },
      { key: "year", label: "Year", render: (row) => refs.academicYearMap[(row as Routine).academicYear] ?? "-" },
      ...commonStatusColumns<Routine>(),
    ],
  },
  syllabus: {
    title: "Syllabus",
    description: "Attach syllabus files against course, department, year, and optional subject.",
    resource: "syllabus",
    singularLabel: "syllabus item",
    searchKeys: ["title", "description", "subjectCode", "subjectTitle"],
    createValues: () => ({
      title: "",
      course: "",
      department: "",
      academicYear: "",
      subject: "",
      subjectCode: "",
      subjectTitle: "",
      description: "",
      files: [],
      isVerified: false,
      isPublished: false,
    }),
    fields: (refs: ReferenceBundle) => [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "course", label: "Course", type: "select", options: () => refs.courseOptions, required: true },
      {
        name: "department",
        label: "Department",
        type: "select",
        options: () => refs.departmentOptions,
        required: true,
      },
      {
        name: "academicYear",
        label: "Academic year",
        type: "select",
        options: () => refs.academicYearOptions,
        required: true,
      },
      { name: "subject", label: "Subject", type: "select", options: () => refs.subjectOptions },
      { name: "subjectCode", label: "Subject code", type: "text" },
      { name: "subjectTitle", label: "Subject title", type: "text" },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "files", label: "Files", type: "files" },
      { name: "isVerified", label: "Verified", type: "checkbox" },
      { name: "isPublished", label: "Published", type: "checkbox" },
    ],
    columns: (refs: ReferenceBundle): DataColumn<Syllabus>[] => [
      {
        key: "title",
        label: "Syllabus",
        render: (row) => (
          <div>
            <div className="font-semibold">{(row as Syllabus).title}</div>
            <div className="text-xs text-[var(--color-text-soft)]">
              {(row as Syllabus).subjectTitle || refs.subjectMap[(row as Syllabus).subject ?? ""] || "-"}
            </div>
          </div>
        ),
      },
      { key: "course", label: "Course", render: (row) => refs.courseMap[(row as Syllabus).course] ?? "-" },
      ...commonStatusColumns<Syllabus>(),
    ],
  },
  questions: {
    title: "Previous Questions",
    description: "Maintain verified question banks with subject and exam year metadata.",
    resource: "questions",
    singularLabel: "question set",
    searchKeys: ["title", "examYear", "description"],
    createValues: () => ({
      title: "",
      course: "",
      department: "",
      academicYear: "",
      subject: "",
      examYear: "",
      description: "",
      files: [],
      isVerified: false,
      isPublished: false,
    }),
    fields: (refs: ReferenceBundle) => [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "course", label: "Course", type: "select", options: () => refs.courseOptions, required: true },
      {
        name: "department",
        label: "Department",
        type: "select",
        options: () => refs.departmentOptions,
        required: true,
      },
      {
        name: "academicYear",
        label: "Academic year",
        type: "select",
        options: () => refs.academicYearOptions,
        required: true,
      },
      { name: "subject", label: "Subject", type: "select", options: () => refs.subjectOptions, required: true },
      { name: "examYear", label: "Exam year", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "files", label: "Files", type: "files" },
      { name: "isVerified", label: "Verified", type: "checkbox" },
      { name: "isPublished", label: "Published", type: "checkbox" },
    ],
    columns: (refs: ReferenceBundle): DataColumn<Question>[] => [
      {
        key: "title",
        label: "Question Set",
        render: (row) => (
          <div>
            <div className="font-semibold">{(row as Question).title}</div>
            <div className="text-xs text-[var(--color-text-soft)]">{(row as Question).examYear}</div>
          </div>
        ),
      },
      { key: "subject", label: "Subject", render: (row) => refs.subjectMap[(row as Question).subject] ?? "-" },
      ...commonStatusColumns<Question>(),
    ],
  },
  resources: {
    title: "Resources",
    description: "Manage notes, suggestions, short questions, important topics, and model questions.",
    resource: "resources",
    singularLabel: "resource",
    searchKeys: ["title", "resourceType", "description"],
    createValues: () => ({
      title: "",
      resourceType: "notes",
      course: "",
      department: "",
      academicYear: "",
      subject: "",
      description: "",
      files: [],
      isVerified: false,
      isPublished: false,
    }),
    fields: (refs: ReferenceBundle) => [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "resourceType",
        label: "Resource type",
        type: "select",
        options: () => [
          { value: "notes", label: "Notes" },
          { value: "suggestions", label: "Suggestions" },
          { value: "short_questions", label: "Short Questions" },
          { value: "important_topics", label: "Important Topics" },
          { value: "model_questions", label: "Model Questions" },
        ],
        required: true,
      },
      { name: "course", label: "Course", type: "select", options: () => refs.courseOptions, required: true },
      {
        name: "department",
        label: "Department",
        type: "select",
        options: () => refs.departmentOptions,
        required: true,
      },
      {
        name: "academicYear",
        label: "Academic year",
        type: "select",
        options: () => refs.academicYearOptions,
        required: true,
      },
      { name: "subject", label: "Subject", type: "select", options: () => refs.subjectOptions },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "files", label: "Files", type: "files" },
      { name: "isVerified", label: "Verified", type: "checkbox" },
      { name: "isPublished", label: "Published", type: "checkbox" },
    ],
    columns: (refs: ReferenceBundle): DataColumn<Resource>[] => [
      {
        key: "title",
        label: "Resource",
        render: (row) => (
          <div>
            <div className="font-semibold">{(row as Resource).title}</div>
            <div className="text-xs text-[var(--color-text-soft)]">{(row as Resource).resourceType}</div>
          </div>
        ),
      },
      { key: "subject", label: "Subject", render: (row) => refs.subjectMap[(row as Resource).subject ?? ""] ?? "-" },
      ...commonStatusColumns<Resource>(),
    ],
  },
};
