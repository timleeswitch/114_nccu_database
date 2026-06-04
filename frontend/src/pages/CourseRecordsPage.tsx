import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { getSchoolCourses } from '../services/courseService';
import {
  createEnrollment,
  deleteEnrollment,
  getStudentEnrollments,
  updateEnrollment,
} from '../services/enrollmentService';
import type { Course } from '../types/course';
import type { EnrollmentRow } from '../types/enrollment';
import { getCourseCategoryLabel } from '../utils/courseCategory';

interface CourseRecordsPageProps {
  studentId: number;
}

interface EnrollmentFormState {
  semester: string;
  category: string;
  courseId: string;
}

const semesters = ['111-1', '111-2', '112-1', '112-2', '113-1', '113-2', '114-1', '114-2'];
const courseCategories = ['必修', '群修', '一般通識', '核心通識', '選修', '體育', '檢定'];
const currentSemester = '114-2';
const allSemesters = '全部';
const allCategories = '全部';

function formatCourseOption(course: Course): string {
  return `[${course.course_code}] ${course.name} - ${course.credits} 學分 - ${getCourseCategoryLabel(course.category)}`;
}

function getCourseById(courses: Course[], courseId: string): Course | undefined {
  return courses.find((course) => course.course_id === courseId);
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
  const [records, setRecords] = useState<EnrollmentRow[]>([]);
  const [schoolCourses, setSchoolCourses] = useState<Course[]>([]);
  const [semesterFilter, setSemesterFilter] = useState(allSemesters);
  const [categoryFilter, setCategoryFilter] = useState(allCategories);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EnrollmentRow | null>(null);
  const [formState, setFormState] = useState<EnrollmentFormState>({
    semester: currentSemester,
    category: allCategories,
    courseId: '',
  });
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

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
  const formCourses = useMemo(
    () =>
      schoolCourses.filter(
        (course) => formState.category === allCategories || course.category === formState.category,
      ),
    [schoolCourses, formState.category],
  );
  const totalCredits = filteredRecords.reduce((sum, record) => sum + Number(record.credits), 0);

  function openCreateForm(): void {
    setEditingRecord(null);
    setFormState({ semester: currentSemester, category: allCategories, courseId: '' });
    setFormError('');
    setIsFormOpen(true);
  }

  function openEditForm(record: EnrollmentRow): void {
    setEditingRecord(record);
    setFormState({
      semester: record.semester,
      category: record.category,
      courseId: String(record.course_id),
    });
    setFormError('');
    setIsFormOpen(true);
  }

  function closeForm(): void {
    setIsFormOpen(false);
    setEditingRecord(null);
    setFormState({ semester: currentSemester, category: allCategories, courseId: '' });
    setFormError('');
  }

  async function handleSubmitEnrollment(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError('');

    const courseId = formState.courseId;

    if (!formState.semester || !courseId) {
      setFormError('請選擇學期與課程。');
      return;
    }

    try {
      if (editingRecord) {
        await updateEnrollment(editingRecord.enrollment_id, {
          course_id: courseId,
          semester: formState.semester,
        });
        setMessage('修課紀錄已更新。');
      } else {
        await createEnrollment(studentId, {
          course_id: courseId,
          semester: formState.semester,
        });
        setMessage('修課紀錄已新增。');
      }

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
      setMessage('修課紀錄已刪除。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '修課紀錄刪除失敗。');
    }
  }

  function handleSaveRecords(): void {
    setMessage('已儲存目前 mock 修課紀錄。');
  }

  return (
    <div
      className="min-h-screen space-y-6 px-4 py-6 md:px-8"
      style={{
        background:
          'radial-gradient(ellipse 55% 60% at 15% 50%, #aacde8CC 0%, transparent 100%), radial-gradient(circle at 65% 40%, #FFCA4BAA 0%, #FFCA4B66 12%, #FFCA4B22 28%, transparent 55%), #ffffff',
      }}
    >
      <Card className="px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">個人修課紀錄</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">修課紀錄</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-500">
              你可以從學校課程庫選擇課程，加入自己的修課紀錄。課程代碼、名稱、學分與類別由系統帶入，不能自行修改。
            </p>
            <p className="mt-2 text-sm text-gray-500">
              目前顯示 {filteredRecords.length} 筆紀錄，合計 {totalCredits} 學分
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="shadow-sm hover:bg-gray-200"
              variant="secondary"
              style={{
                background: '#f3f4f6',
                border: '1px solid rgba(229,231,235,0.95)',
              }}
              onClick={() => navigate('/status')}
            >
              檢核頁
            </Button>
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
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value={allCategories}>全部</option>
            {courseCategories.map((category) => (
              <option key={category} value={category}>
                {getCourseCategoryLabel(category)}
              </option>
            ))}
          </Select>
        </div>

        {message && (
          <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</p>
        )}
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
                      <Button className="px-4 py-2" variant="secondary" onClick={() => openEditForm(record)}>
                        編輯
                      </Button>
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
              {editingRecord ? '儲存修改' : '新增紀錄'}
            </Button>
          </div>
        }
        isOpen={isFormOpen}
        title={editingRecord ? '編輯修課紀錄' : '新增修課紀錄'}
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
              label="類別"
              value={formState.category}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  category: event.target.value,
                  courseId: '',
                }))
              }
            >
              <option value={allCategories}>全部</option>
              {courseCategories.map((category) => (
                <option key={category} value={category}>
                  {getCourseCategoryLabel(category)}
                </option>
              ))}
            </Select>
            <Select
              label="課程"
              value={formState.courseId}
              onChange={(event) => setFormState((current) => ({ ...current, courseId: event.target.value }))}
            >
              <option value="">請選擇課程</option>
              {formCourses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {formatCourseOption(course)}
                </option>
              ))}
            </Select>
          </div>
          <CoursePreview course={selectedCourse} />
          {formError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>}
        </form>
      </Modal>
    </div>
  );
}
