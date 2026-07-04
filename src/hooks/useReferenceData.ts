"use client";

import { useMemo } from "react";
import { useCrudResource } from "@/hooks/useCrudResource";

export function useReferenceData() {
  const courses = useCrudResource("courses");
  const departments = useCrudResource("departments");
  const academicYears = useCrudResource("academic-years");
  const subjects = useCrudResource("subjects");

  const maps = useMemo(
    () => ({
      courseMap: Object.fromEntries(courses.items.map((item) => [item.id, item.name])),
      departmentMap: Object.fromEntries(departments.items.map((item) => [item.id, item.name])),
      academicYearMap: Object.fromEntries(academicYears.items.map((item) => [item.id, item.name])),
      subjectMap: Object.fromEntries(subjects.items.map((item) => [item.id, `${item.code} · ${item.title}`])),
    }),
    [academicYears.items, courses.items, departments.items, subjects.items],
  );

  return {
    courses,
    departments,
    academicYears,
    subjects,
    maps,
    loading:
      courses.loading ||
      departments.loading ||
      academicYears.loading ||
      subjects.loading,
    error:
      courses.error ||
      departments.error ||
      academicYears.error ||
      subjects.error,
  };
}
