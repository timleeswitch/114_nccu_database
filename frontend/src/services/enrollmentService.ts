import { mockCourses } from '../mocks/mockCourses';
import { mockEnrollments } from '../mocks/mockEnrollments';
import type { Enrollment, EnrollmentRow } from '../types/enrollment';

export interface CreateEnrollmentData {
  course_id: number;
  semester: string;
}

export interface UpdateEnrollmentData {
  course_id?: number;
  semester?: string;
}

function findCourse(courseId: number) {
  return mockCourses.find((course) => course.course_id === courseId);
}

function assertCourseExists(courseId: number): void {
  if (!findCourse(courseId)) {
    throw new Error('此課程不在學校課程庫中，請聯絡系辦或管理員維護課程庫。');
  }
}

function assertNoDuplicate(studentId: number, courseId: number, currentEnrollmentId?: number): void {
  const hasDuplicate = mockEnrollments.some(
    (enrollment) =>
      enrollment.student_id === studentId &&
      enrollment.course_id === courseId &&
      enrollment.enrollment_id !== currentEnrollmentId,
  );

  if (hasDuplicate) {
    throw new Error('這門課已經在你的修課紀錄中。');
  }
}

function buildEnrollmentRow(enrollment: Enrollment): EnrollmentRow | undefined {
  const course = findCourse(enrollment.course_id);

  if (!course) {
    return undefined;
  }

  return {
    enrollment_id: enrollment.enrollment_id,
    student_id: enrollment.student_id,
    course_id: enrollment.course_id,
    semester: enrollment.semester,
    course_code: course.course_code,
    course_name: course.name,
    credits: course.credits,
    category: course.category,
  };
}

function nextEnrollmentId(): number {
  const maxId = mockEnrollments.reduce(
    (currentMax, enrollment) => Math.max(currentMax, enrollment.enrollment_id),
    0,
  );

  return maxId + 1;
}

export async function getStudentEnrollments(studentId: number): Promise<EnrollmentRow[]> {
  const rows = mockEnrollments
    .filter((enrollment) => enrollment.student_id === studentId)
    .map(buildEnrollmentRow)
    .filter((row): row is EnrollmentRow => Boolean(row))
    .sort((first, second) => second.semester.localeCompare(first.semester));

  return Promise.resolve(rows);
}

export async function createEnrollment(
  studentId: number,
  data: CreateEnrollmentData,
): Promise<EnrollmentRow> {
  assertCourseExists(data.course_id);
  assertNoDuplicate(studentId, data.course_id);

  const enrollment: Enrollment = {
    enrollment_id: nextEnrollmentId(),
    student_id: studentId,
    course_id: data.course_id,
    semester: data.semester,
  };

  mockEnrollments.push(enrollment);

  const row = buildEnrollmentRow(enrollment);

  if (!row) {
    throw new Error('無法建立修課紀錄。');
  }

  return Promise.resolve(row);
}

export async function updateEnrollment(
  enrollmentId: number,
  data: UpdateEnrollmentData,
): Promise<EnrollmentRow> {
  const enrollment = mockEnrollments.find((item) => item.enrollment_id === enrollmentId);

  if (!enrollment) {
    throw new Error('找不到修課紀錄。');
  }

  const nextCourseId = data.course_id ?? enrollment.course_id;

  assertCourseExists(nextCourseId);
  assertNoDuplicate(enrollment.student_id, nextCourseId, enrollmentId);

  enrollment.course_id = nextCourseId;
  enrollment.semester = data.semester ?? enrollment.semester;

  const row = buildEnrollmentRow(enrollment);

  if (!row) {
    throw new Error('無法更新修課紀錄。');
  }

  return Promise.resolve(row);
}

export async function deleteEnrollment(enrollmentId: number): Promise<void> {
  const enrollmentIndex = mockEnrollments.findIndex(
    (enrollment) => enrollment.enrollment_id === enrollmentId,
  );

  if (enrollmentIndex < 0) {
    throw new Error('找不到修課紀錄。');
  }

  mockEnrollments.splice(enrollmentIndex, 1);

  return Promise.resolve();
}
