import NavBar from '../components/NavBar';
import CategoryCard from '../components/CategoryCard';
import type { CreditCategory } from '../components/CategoryCard';

const mockStudent = {
  name: '張小明',
  studentId: '110205069',
  department: '資訊科學系',
  grade: '大四',
};

const mockCategories: CreditCategory[] = [
  { name: '系必修', completed: 48, required: 52 },
  { name: '系選修', completed: 24, required: 24 },
  { name: '通識', completed: 16, required: 20 },
  { name: '體育', completed: 8, required: 8 },
  { name: '系外選修', completed: 0, required: 24 },
];

const totalCompleted = mockCategories.reduce((sum, c) => sum + c.completed, 0);
const totalRequired = mockCategories.reduce((sum, c) => sum + c.required, 0);

const glassCard: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
};

export default function GraduationStatusPage() {
  const donutR = 46;
  const circumference = 2 * Math.PI * donutR;
  const filledArc = circumference * (totalCompleted / totalRequired);

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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">畢業學分狀態</h1>
          <p className="text-gray-500 mt-1">
            {mockStudent.department} · {mockStudent.grade} · {mockStudent.studentId}
          </p>
        </div>

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
                {Math.round((totalCompleted / totalRequired) * 100)}%
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
                  <span className="text-5xl font-bold text-amber-400">{totalRequired - totalCompleted}</span>
                  <span className="text-xl text-gray-400 ml-1">學分</span>
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-base mb-1">完成類別</p>
                <p className="leading-none">
                  <span className="text-5xl font-bold" style={{ color: '#50C878' }}>
                    {mockCategories.filter((c) => c.completed >= c.required).length}
                  </span>
                  <span className="text-xl text-gray-400 ml-1">/ {mockCategories.length}</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-row gap-3 shrink-0">
              {['修課紀錄', '問題回報'].map((label) => (
                <button
                  key={label}
                  className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-400 transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(40px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.45)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.1)',
                  }}
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
          {mockCategories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </main>
    </div>
  );
}
