import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Toast from '../components/ui/Toast';
import type { ToastTone } from '../components/ui/Toast';
import { getSchoolCourses } from '../services/courseService';
import {
  createEnrollment,
  deleteEnrollment,
  getStudentEnrollments,
} from '../services/enrollmentService';
import type { Course, CourseCategory } from '../types/course';
import type { EnrollmentRow } from '../types/enrollment';
import { getCourseCategoryLabel } from '../utils/courseCategory';

interface CourseRecordsPageProps {
  studentId: string;
}

interface EnrollmentFormState {
  semester: string;
  courseId: string;
}

interface ToastState {
  message: string;
  tone: ToastTone;
}

const semesters = ['111-1', '111-2', '112-1', '112-2', '113-1', '113-2', '114-1', '114-2'];
const currentSemester = '114-2';
const allSemesters = '全部';
const allCategories = '全部';
type CategoryFilter = typeof allCategories | CourseCategory;

const courseCategories: CourseCategory[] = [
  'required',
  'elective',
  'external',
  'pe',
  'general',
];

function formatCourseOption(course: Course): string {
  const categoryLabel = getCourseCategoryLabel(course.category);

  if (course.category === 'external' && course.sub_category) {
    return `[${course.course_code}] ${course.name} - ${course.credits} 學分 - ${categoryLabel} - ${course.sub_category}`;
  }

  return `[${course.course_code}] ${course.name} - ${course.credits} 學分 - ${categoryLabel}`;
}

function formatCourseSummary(course: Course): string {
  const categoryLabel = getCourseCategoryLabel(course.category);

  if (course.category === 'external' && course.sub_category) {
    return `${course.course_code} · ${course.credits} 學分 · ${categoryLabel} · ${course.sub_category}`;
  }

  return `${course.course_code} · ${course.credits} 學分 · ${categoryLabel}`;
}

function getCourseById(courses: Course[], courseId: string): Course | undefined {
  return courses.find((course) => course.course_id === Number(courseId));
}

function CoursePreview({ course }: { course?: Course }) {
  if (!course) {
    return (
      <div className="rounded-2xl bg-white/55 px-5 py-4 text-sm text-gray-500">
        選擇課程後，系統會在這裡顯示只讀課程資訊。
      </div>
    );
  }

  const previewItems = [
    ['課程代碼', course.course_code],
    ['課程名稱', course.name],
    ['課程類別', getCourseCategoryLabel(course.category)],
    ...(course.category === 'external' && course.sub_category
      ? [['系別', course.sub_category]]
      : []),
    ['學分', `${course.credits} 學分`],
  ];

  return (
    <div className="grid gap-3 rounded-2xl bg-white/55 px-5 py-4 text-sm text-gray-600 md:grid-cols-2">
      {previewItems.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs font-medium text-gray-400">{label}</p>
          <p className="mt-1 font-medium text-gray-800">{value}</p>
        </div>
      ))}
    </div>
  );
}

export default function CourseRecordsPage({ studentId }: CourseRecordsPageProps) {
  const [records, setRecords] = useState<EnrollmentRow[]>([]);
  const [schoolCourses, setSchoolCourses] = useState<Course[]>([]);
  const [semesterFilter, setSemesterFilter] = useState(allSemesters);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(allCategories);
  const [coursePickerCategory, setCoursePickerCategory] = useState<CategoryFilter>(allCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<EnrollmentFormState>({
    semester: currentSemester,
    courseId: '',
  });
  const [courseSearch, setCourseSearch] = useState('');
  const [isCourseSearchOpen, setIsCourseSearchOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formError, setFormError] = useState('');
  const courseSearchRef = useRef<HTMLDivElement>(null);

  function showToast(message: string, tone: ToastTone = 'success'): void {
    setToast({ message, tone });
  }

  async function loadRecords(): Promise<void> {
    const studentRecords = await getStudentEnrollments(studentId);
    setRecords(studentRecords);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData(): Promise<void> {
      const [studentRecords, courses] = await Promise.all([
        getStudentEnrollments(studentId),
        getSchoolCourses(),
      ]);

      if (isMounted) {
        setRecords(studentRecords);
        setSchoolCourses(courses);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  useEffect(() => {
    if (!isCourseSearchOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent): void {
      if (
        courseSearchRef.current &&
        !courseSearchRef.current.contains(event.target as Node)
      ) {
        setIsCourseSearchOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isCourseSearchOpen]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSemester =
        semesterFilter === allSemesters || record.semester === semesterFilter;
      const matchesCategory =
        categoryFilter === allCategories || record.category === categoryFilter;

      return matchesSemester && matchesCategory;
    });
  }, [records, semesterFilter, categoryFilter]);

  const selectedCourse = getCourseById(schoolCourses, formState.courseId);
  const totalCredits = filteredRecords.reduce((sum, record) => sum + record.credits, 0);
  const filteredSchoolCourses = useMemo(() => {
    const keyword = courseSearch.trim().toLowerCase();

    return schoolCourses.filter((course) => {
      const matchesCategory =
        coursePickerCategory === allCategories || course.category === coursePickerCategory;
      const matchesKeyword =
        !keyword ||
        course.course_code.toLowerCase().includes(keyword) ||
        course.name.toLowerCase().includes(keyword) ||
        course.category.toLowerCase().includes(keyword) ||
        getCourseCategoryLabel(course.category).includes(keyword) ||
        (course.sub_category ?? '').toLowerCase().includes(keyword);

      return (
        matchesCategory &&
        matchesKeyword
      );
    });
  }, [schoolCourses, courseSearch, coursePickerCategory]);
  const shouldShowCourseSuggestions = isCourseSearchOpen && courseSearch.trim().length > 0;

  function openCreateForm(): void {
    setFormState({ semester: currentSemester, courseId: '' });
    setCoursePickerCategory(allCategories);
    setCourseSearch('');
    setIsCourseSearchOpen(false);
    setFormError('');
    setIsFormOpen(true);
  }

  function closeForm(): void {
    setIsFormOpen(false);
    setFormState({ semester: currentSemester, courseId: '' });
    setCoursePickerCategory(allCategories);
    setCourseSearch('');
    setIsCourseSearchOpen(false);
    setFormError('');
  }

  function selectCourse(course: Course): void {
    setFormState((current) => ({ ...current, courseId: String(course.course_id) }));
    setCourseSearch(course.name);
    setIsCourseSearchOpen(false);
  }

  function handleCourseSearchChange(value: string): void {
    setCourseSearch(value);
    setFormState((current) => ({ ...current, courseId: '' }));
    setIsCourseSearchOpen(true);
    setFormError('');
  }

  function handleCourseSelectChange(courseId: string): void {
    const course = getCourseById(schoolCourses, courseId);

    setFormState((current) => ({ ...current, courseId }));
    setCourseSearch(course?.name ?? '');
    setIsCourseSearchOpen(false);
    setFormError('');
  }

  function handleCoursePickerCategoryChange(category: CategoryFilter): void {
    setCoursePickerCategory(category);
    setFormState((current) => ({ ...current, courseId: '' }));
    setCourseSearch('');
    setIsCourseSearchOpen(false);
    setFormError('');
  }

  async function handleSubmitEnrollment(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError('');

    const courseId = Number(formState.courseId);

    if (!formState.semester || !courseId) {
      setFormError('請選擇學期與課程。');
      return;
    }

    try {
      await createEnrollment(studentId, {
        course_id: courseId,
        semester: formState.semester,
      });
      showToast('修課紀錄已新增。');

      await loadRecords();
      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '修課紀錄儲存失敗。');
    }
  }

  async function handleDeleteEnrollment(enrollmentId: number): Promise<void> {
    const confirmed = window.confirm('確定要刪除這筆修課紀錄嗎？');

    if (!confirmed) {
      return;
    }

    try {
      await deleteEnrollment(enrollmentId);
      await loadRecords();
      showToast('修課紀錄已刪除。');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '修課紀錄刪除失敗。', 'error');
    }
  }

  function handleSaveRecords(): void {
    showToast('已儲存目前 mock 修課紀錄。');
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          tone={toast.tone}
          onClose={() => setToast(null)}
        />
      )}
      <Card className="px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">個人修課紀錄</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">修課紀錄</h2>
            <p className="mt-2 text-sm text-gray-500">
              目前顯示 {filteredRecords.length} 筆紀錄，合計 {totalCredits} 學分
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={openCreateForm}>新增修課紀錄</Button>
            <Button variant="secondary" onClick={handleSaveRecords}>
              儲存紀錄
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:max-w-2xl">
          <Select
            label="學期篩選"
            value={semesterFilter}
            onChange={(event) => setSemesterFilter(event.target.value)}
          >
            <option value={allSemesters}>全部</option>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </Select>
          <Select
            label="類別篩選"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
          >
            <option value={allCategories}>全部</option>
            {courseCategories.map((category) => (
              <option key={category} value={category}>
                {getCourseCategoryLabel(category)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/70 text-sm text-gray-500">
                <th className="px-5 py-4 font-medium">學期</th>
                <th className="px-5 py-4 font-medium">課程代碼</th>
                <th className="px-5 py-4 font-medium">課程名稱</th>
                <th className="px-5 py-4 font-medium">課程類別</th>
                <th className="px-5 py-4 font-medium">學分</th>
                <th className="px-5 py-4 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.enrollment_id} className="border-b border-white/50 text-sm text-gray-700">
                  <td className="px-5 py-4">{record.semester}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{record.course_code}</td>
                  <td className="px-5 py-4">{record.course_name}</td>
                  <td className="px-5 py-4">{getCourseCategoryLabel(record.category)}</td>
                  <td className="px-5 py-4">{record.credits}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button
                        className="px-4 py-2"
                        variant="danger"
                        onClick={() => handleDeleteEnrollment(record.enrollment_id)}
                      >
                        刪除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td className="px-5 py-10 text-center text-gray-500" colSpan={6}>
                    目前沒有符合條件的修課紀錄。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeForm}>
              取消
            </Button>
            <Button form="enrollment-form" type="submit">
              新增紀錄
            </Button>
          </div>
        }
        isOpen={isFormOpen}
        title="新增修課紀錄"
        onClose={closeForm}
      >
        <form className="grid gap-5" id="enrollment-form" onSubmit={handleSubmitEnrollment}>
          <div className="grid gap-5 md:grid-cols-3">
            <Select
              label="學期"
              value={formState.semester}
              onChange={(event) => setFormState((current) => ({ ...current, semester: event.target.value }))}
            >
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </Select>
            <Select
              label="課程類別"
              value={coursePickerCategory}
              onChange={(event) => handleCoursePickerCategoryChange(event.target.value as CategoryFilter)}
            >
              <option value={allCategories}>全部</option>
              {courseCategories.map((category) => (
                <option key={category} value={category}>
                  {getCourseCategoryLabel(category)}
                </option>
              ))}
            </Select>
            <div className="relative" ref={courseSearchRef}>
              <Input
                label="搜尋課程"
                placeholder="輸入課程代碼、名稱或類別"
                value={courseSearch}
                onChange={(event) => handleCourseSearchChange(event.target.value)}
                onFocus={() => setIsCourseSearchOpen(true)}
              />
              {shouldShowCourseSuggestions && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-72 overflow-auto rounded-2xl border border-white/70 bg-white/95 p-2 shadow-xl backdrop-blur-xl">
                  {filteredSchoolCourses.length > 0 ? (
                    filteredSchoolCourses.map((course) => (
                      <button
                        key={course.course_id}
                        className="w-full rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-blue-50"
                        onClick={() => selectCourse(course)}
                        type="button"
                      >
                        <span className="block font-medium text-gray-900">{course.name}</span>
                        <span className="mt-1 block text-xs text-gray-500">
                          {formatCourseSummary(course)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-500">沒有符合類別或搜尋條件的課程。</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <Select
            label="課程"
            value={formState.courseId}
            onChange={(event) => handleCourseSelectChange(event.target.value)}
          >
            <option value="">請選擇課程</option>
            {filteredSchoolCourses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {formatCourseOption(course)}
              </option>
            ))}
          </Select>
          {filteredSchoolCourses.length === 0 && (
            <p className="rounded-2xl bg-white/55 px-4 py-3 text-sm text-gray-500">
              沒有符合類別或搜尋條件的課程。
            </p>
          )}
          <CoursePreview course={selectedCourse} />
          {formError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>}
        </form>
      </Modal>
    </div>
  );
}
