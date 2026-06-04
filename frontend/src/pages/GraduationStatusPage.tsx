import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import CategoryCard from '../components/CategoryCard';
import CourseSearchBar from '../components/CourseSearchBar';
import ProfileMenu from '../components/ProfileMenu';
import { getGraduationCheck } from '../services/graduationService';
import { glassCard, glassButton } from '../styles/glass';
import type { CreditCategory } from '../components/CategoryCard';

const mockStudent = {
  studentId: localStorage.getItem('student_id') ?? '',
  department: '資訊科學系',
};

function formatCategoryName(category: string, subCategory: string | null): string {
  return subCategory ? `${category} - ${subCategory}` : category;
}

export default function GraduationStatusPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CreditCategory[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalRequired, setTotalRequired] = useState(128);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    getGraduationCheck()
      .then((result) => {
        if (!isMounted) return;
        setCategories(
          result.summary.map((item) => ({
            name: formatCategoryName(item.category, item.sub_category),
            completed: item.completed,
            required: item.required,
          })),
        );
        setTotalCompleted(result.total_completed);
        setTotalRequired(result.total_required);
      })
      .catch((caughtError) => {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : '無法取得畢業學分檢核結果。');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const remainingCredits = Math.max(0, totalRequired - totalCompleted);
  const completionRate = totalRequired > 0 ? Math.min(1, totalCompleted / totalRequired) : 0;
  const donutR = 46;
  const circumference = 2 * Math.PI * donutR;
  const filledArc = circumference * completionRate;

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background:
          'radial-gradient(ellipse 55% 60% at 15% 50%, #aacde8CC 0%, transparent 100%), radial-gradient(circle at 65% 40%, #FFCA4BAA 0%, #FFCA4B66 12%, #FFCA4B22 28%, transparent 55%), #ffffff',
      }}
    >
      <NavBar />

      <main className="px-6 md:px-16 py-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-6 md:pr-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">畢業學分狀態</h1>
            <p className="text-gray-500 mt-1">
              {mockStudent.department} · {mockStudent.studentId}
            </p>
          </div>
          <ProfileMenu />
        </div>

        {error && (
          <p className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {/* Course search bar */}
        <CourseSearchBar onAdd={(course) => console.log('Add course:', course)} />

        {/* Overall summary card */}
        <div className="rounded-3xl px-10 py-8 mb-8" style={glassCard}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Donut */}
            <svg viewBox="0 0 120 120" className="w-36 h-36 shrink-0">
              <defs>
                <linearGradient id="statusDonutGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#aacde8" />
                  <stop offset="100%" stopColor="#5a9fd4" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r={donutR} fill="none" stroke="#ddeeff" strokeWidth="18" />
              <circle
                cx="60" cy="60" r={donutR}
                fill="none"
                stroke="url(#statusDonutGrad)"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={`${filledArc - 3} ${circumference - filledArc + 3}`}
                transform="rotate(-90 60 60)"
              />
              <text x="61" y="65" textAnchor="middle" fill="#6b8cba" fontSize="18" fontWeight="bold">
                {Math.round(completionRate * 100)}%
              </text>
            </svg>

            <div className="w-px h-20 rounded-full bg-gray-200 shrink-0 hidden md:block" />

            {/* Stats */}
            <div className="flex-1 flex flex-col sm:flex-row gap-8 text-center md:text-left">
              <div>
                <p className="text-gray-400 text-base mb-1">已修學分</p>
                <p className="leading-none">
                  <span className="text-5xl font-bold" style={{ color: '#6b8cba' }}>{totalCompleted}</span>
                  <span className="text-xl text-gray-400 ml-1">/ {totalRequired}</span>
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-base mb-1">尚缺學分</p>
                <p className="leading-none">
                  <span className="text-5xl font-bold text-amber-400">{remainingCredits}</span>
                  <span className="text-xl text-gray-400 ml-1">學分</span>
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-base mb-1">完成類別</p>
                <p className="leading-none">
                  <span className="text-5xl font-bold" style={{ color: '#50C878' }}>
                    {categories.filter((c) => c.completed >= c.required).length}
                  </span>
                  <span className="text-xl text-gray-400 ml-1">/ {categories.length}</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-row gap-3 shrink-0">
              {['修課紀錄', '問題回報'].map((label) => (
                <button
                  key={label}
                  onClick={label === '修課紀錄' ? () => navigate('/records') : undefined}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-400 transition-all"
                  style={glassButton}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">學分類別明細</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </main>
    </div>
  );
}
