import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import SystemTabs from '../components/SystemTabs';
import Button from '../components/ui/Button';
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
import { getStudent } from '../services/studentService';
import { glassButton, glassCard } from '../styles/glass';
import type { Course, CourseCategory } from '../types/course';
import type { EnrollmentRow } from '../types/enrollment';
import type { Student } from '../types/student';

interface CourseRecordsPageProps {
  studentId: number;
}

interface EnrollmentFormState {
  semester: string;
  courseId: string;
}

interface ToastState {
  message: string;
  tone: ToastTone;
}

type CategoryFilter =
  | '全部'
  | 'required'
  | 'physical_education'
  | 'general'
  | 'free_elective'
  | 'external';

const semesters = ['111-1', '111-2', '112-1', '112-2', '113-1', '113-2', '114-1', '114-2'];
const currentSemester = '114-2';
const allSemesters = '全部';
const allCategories = '全部';
const defaultGrade = '大四';

const categoryOptions: Array<{ label: string; value: CategoryFilter }> = [
  { label: allCategories, value: allCategories },
  { label: '必修', value: 'required' },
  { label: '體育', value: 'physical_education' },
  { label: '通識', value: 'general' },
  { label: '選修', value: 'free_elective' },
  { label: '外系課程', value: 'external' },
];

function getCategoryLabel(category: CourseCategory | string): string {
  if (category === 'required') {
    return '必修';
  }

  if (category === 'physical_education') {
    return '體育';
  }

  if (category === 'general_education' || category === 'core_general') {
    return '通識';
  }

  if (category === 'core_elective' || category === 'free_elective') {
    return '選修';
  }

  if (category === 'external') {
    return '外系課程';
  }

  return '其他';
}

function matchesCategory(category: string, filter: CategoryFilter): boolean {
  if (filter === allCategories) {
    return true;
  }

  if (filter === 'general') {
    return category === 'general_education' || category === 'core_general';
  }

  if (filter === 'free_elective') {
    return category === 'free_elective' || category === 'core_elective';
  }

  return category === filter;
}

function formatCourseOption(course: Course): string {
  return `[${course.course_code}] ${course.name} - ${course.credits} 學分 - ${getCategoryLabel(course.category)}`;
}

function getCourseById(courses: Course[], courseId: string): Course | undefined {
  return courses.find((course) => course.course_id === Number(courseId));
}

function CoursePreview({ course }: { course?: Course }) {
  if (!course) {
    return (
      <div className="rounded-2xl bg-white/55 px-5 py-4 text-base text-gray-500">
        選擇課程後，系統會在這裡顯示只讀課程資訊。
      </div>
    );
  }

  const previewItems = [
    ['課程代碼', course.course_code],
    ['課程名稱', course.name],
    ['課程類別', getCategoryLabel(course.category)],
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
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<EnrollmentRow[]>([]);
  const [schoolCourses, setSchoolCourses] = useState<Course[]>([]);
  const [semesterFilter, setSemesterFilter] = useState(allSemesters);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(allCategories);
  const [coursePickerCategory, setCoursePickerCategory] = useState<CategoryFilter>(allCategories);
  const [courseSearch, setCourseSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<EnrollmentFormState>({
    semester: currentSemester,
    courseId: '',
  });
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formError, setFormError] = useState('');

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
      const [studentData, studentRecords, courses] = await Promise.all([
        getStudent(studentId),
        getStudentEnrollments(studentId),
        getSchoolCourses(),
      ]);

      if (isMounted) {
        setStudent(studentData ?? null);
        setRecords(studentRecords);
        setSchoolCourses(courses);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const isSameSemester =
        semesterFilter === allSemesters || record.semester === semesterFilter;
      const isSameCategory = matchesCategory(record.category, categoryFilter);

      return isSameSemester && isSameCategory;
    });
  }, [records, semesterFilter, categoryFilter]);

  const filteredSchoolCourses = useMemo(() => {
    const keyword = courseSearch.trim().toLowerCase();

    return schoolCourses.filter((course) => {
      const isSameCategory = matchesCategory(course.category, coursePickerCategory);
      const label = getCategoryLabel(course.category);
      const isSameKeyword =
        !keyword ||
        course.course_code.toLowerCase().includes(keyword) ||
        course.name.toLowerCase().includes(keyword) ||
        course.category.toLowerCase().includes(keyword) ||
        label.toLowerCase().includes(keyword) ||
        label.includes(courseSearch.trim());

      return isSameCategory && isSameKeyword;
    });
  }, [schoolCourses, coursePickerCategory, courseSearch]);

  const selectedCourse = getCourseById(schoolCourses, formState.courseId);
  const totalCredits = filteredRecords.reduce((sum, record) => sum + record.credits, 0);
  const studentInfo = `${student?.department ?? '資訊科學系'} · ${defaultGrade} · ${student?.student_id ?? studentId}`;

  function openCreateForm(): void {
    setFormState({ semester: currentSemester, courseId: '' });
    setCoursePickerCategory(allCategories);
    setCourseSearch('');
    setFormError('');
    setIsFormOpen(true);
  }

  function closeForm(): void {
    setIsFormOpen(false);
    setFormState({ semester: currentSemester, courseId: '' });
    setCoursePickerCategory(allCategories);
    setCourseSearch('');
    setFormError('');
  }

  function handleCourseCategoryChange(value: CategoryFilter): void {
    setCoursePickerCategory(value);
    setCourseSearch('');
    setFormState((current) => ({ ...current, courseId: '' }));
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

      await loadRecords();
      closeForm();
      showToast('修課紀錄已新增。');
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

  function handleLogout(): void {
    navigate('/');
  }

  return (
    <div
      className="min-h-screen font-sans text-gray-900"
      style={{
        background:
          'radial-gradient(ellipse 55% 60% at 15% 50%, #aacde8CC 0%, transparent 100%), radial-gradient(circle at 65% 40%, #FFCA4BAA 0%, #FFCA4B66 12%, #FFCA4B22 28%, transparent 55%), #ffffff',
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          tone={toast.tone}
          onClose={() => setToast(null)}
        />
      )}

      <NavBar />

      <main className="mx-auto max-w-5xl px-6 py-5 md:px-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">修課紀錄</h1>
            <p className="mt-1 text-gray-500">{studentInfo}</p>
          </div>
          <button
            className="w-fit rounded-full px-5 py-2.5 text-sm font-medium text-gray-500 transition-all hover:text-gray-800"
            style={glassButton}
            type="button"
            onClick={handleLogout}
          >
            登出
          </button>
        </div>

        <SystemTabs />

        <section className="mb-8 rounded-3xl px-6 py-6 md:px-8" style={glassCard}>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-gray-400">個人修課紀錄</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">修課紀錄</h2>
              <p className="mt-3 text-base font-medium text-gray-500">
                目前顯示 {filteredRecords.length} 筆紀錄，合計 {totalCredits} 學分
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:pt-7">
              <Button className="rounded-full px-7 py-3 text-sm" onClick={openCreateForm}>
                新增修課紀錄
              </Button>
              <Button
                className="rounded-full px-7 py-3 text-sm"
                style={glassButton}
                variant="secondary"
                onClick={handleSaveRecords}
              >
                儲存紀錄
              </Button>
            </div>
          </div>

          <div
            className="mt-7 grid gap-4 rounded-2xl px-4 py-4 md:grid-cols-2"
            style={{
              background: 'rgba(255,255,255,0.38)',
              border: '1px solid rgba(255,255,255,0.55)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
            }}
          >
            <Select
              className="rounded-2xl py-3.5 text-sm"
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
              className="rounded-2xl py-3.5 text-sm"
              label="類別篩選"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl" style={glassCard}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/70 bg-white/35 text-sm text-gray-500">
                  <th className="px-5 py-4 font-semibold">學期</th>
                  <th className="px-5 py-4 font-semibold">課程代碼</th>
                  <th className="px-5 py-4 font-semibold">課程名稱</th>
                  <th className="px-5 py-4 font-semibold">課程類別</th>
                  <th className="px-5 py-4 font-semibold">學分</th>
                  <th className="px-5 py-4 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr
                    key={record.enrollment_id}
                    className="border-b border-white/45 text-sm font-medium text-gray-700 last:border-b-0"
                  >
                    <td className="px-5 py-4">{record.semester}</td>
                    <td className="px-5 py-4 font-bold text-gray-900">{record.course_code}</td>
                    <td className="px-5 py-4">{record.course_name}</td>
                    <td className="px-5 py-4">{getCategoryLabel(record.category)}</td>
                    <td className="px-5 py-4">{record.credits}</td>
                    <td className="px-5 py-4">
                      <Button
                        className="rounded-2xl bg-red-500 px-5 py-2.5 text-sm hover:bg-red-600"
                        variant="danger"
                        onClick={() => handleDeleteEnrollment(record.enrollment_id)}
                      >
                        刪除
                      </Button>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td className="px-5 py-12 text-center text-gray-500" colSpan={6}>
                      目前沒有符合條件的修課紀錄。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Modal
        footer={
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Button
              className="rounded-full px-7 py-3 text-sm"
              style={glassButton}
              variant="secondary"
              onClick={closeForm}
            >
              取消
            </Button>
            <Button className="rounded-full px-7 py-3 text-sm" form="enrollment-form" type="submit">
              新增紀錄
            </Button>
          </div>
        }
        isOpen={isFormOpen}
        title="新增修課紀錄"
        onClose={closeForm}
      >
        <form className="grid gap-6" id="enrollment-form" onSubmit={handleSubmitEnrollment}>
          <div className="grid gap-5 lg:grid-cols-3">
            <Select
              className="rounded-2xl py-3.5 text-sm"
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
              className="rounded-2xl py-3.5 text-sm"
              label="課程類別"
              value={coursePickerCategory}
              onChange={(event) => handleCourseCategoryChange(event.target.value as CategoryFilter)}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Input
              className="rounded-2xl py-3.5 text-sm"
              label="搜尋課程"
              placeholder="輸入課程代碼、名稱或類別"
              value={courseSearch}
              onChange={(event) => {
                setCourseSearch(event.target.value);
                setFormState((current) => ({ ...current, courseId: '' }));
                setFormError('');
              }}
            />
          </div>

          <Select
            className="rounded-2xl py-3.5 text-sm"
            label="課程"
            value={formState.courseId}
            onChange={(event) => {
              setFormState((current) => ({ ...current, courseId: event.target.value }));
              setFormError('');
            }}
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

          {formError && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {formError}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
