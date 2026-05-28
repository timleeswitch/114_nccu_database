import { useState, useRef, useEffect } from 'react';

const mockCourses = [
  { code: 'CS101', name: '程式設計', credits: 3 },
  { code: 'CS201', name: '資料結構', credits: 3 },
  { code: 'CS301', name: '演算法', credits: 3 },
  { code: 'CS401', name: '作業系統', credits: 3 },
  { code: 'GE101', name: '英文寫作', credits: 2 },
  { code: 'GE201', name: '微積分', credits: 4 },
  { code: 'PE101', name: '體育', credits: 1 },
];

interface Course {
  code: string;
  name: string;
  credits: number;
}

interface CourseSearchBarProps {
  onAdd: (course: Course) => void;
}

export default function CourseSearchBar({ onAdd }: CourseSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (blurTimer.current) clearTimeout(blurTimer.current); };
  }, []);

  const filtered = query.trim()
    ? mockCourses.filter(
        (c) =>
          c.name.includes(query) || c.code.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  function handleSelect(course: Course) {
    onAdd(course);
    setQuery('');
    setShowDropdown(false);
  }

  return (
    <div className="relative mb-6">
      <div
        className="flex items-center gap-3 rounded-2xl px-5 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 32px rgba(100,140,180,0.2), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.04)',
        }}
      >
        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => { blurTimer.current = setTimeout(() => setShowDropdown(false), 150); }}
          placeholder="搜尋課程代碼或名稱新增課程..."
          className="flex-1 bg-transparent outline-none text-base placeholder-gray-300 rainbow-text"
        />
      </div>

      {showDropdown && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-10"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          {filtered.map((course) => (
            <button
              key={course.code}
              onMouseDown={() => handleSelect(course)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm hover:bg-blue-50 transition-colors text-left"
            >
              <span className="text-gray-700 font-medium">{course.name}</span>
              <span className="text-gray-400">{course.code} · {course.credits} 學分</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
