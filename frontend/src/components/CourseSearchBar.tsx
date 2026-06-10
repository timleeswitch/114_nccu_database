import { useState, useRef, useEffect } from 'react';
import { glassInput, glassButton } from '../styles/glass';
import type { CourseCategory } from '../types/course';
import { getCourseCategoryLabel } from '../utils/courseCategory';

const defaultCourses = [
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
  courses?: Course[];
  semesterFilter?: string;
  onSemesterChange?: (value: string) => void;
  categoryFilter?: string;
  onCategoryChange?: (value: string) => void;
  semesters?: string[];
  allSemesters?: string;
  allCategories?: string;
}

const filterPanelStyle = {
  background: 'rgba(255, 255, 255, 0.55)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 8px 24px rgba(100,140,180,0.12)',
};

const selectStyle = {
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(255,255,255,0.6)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

const categoryOptions: CourseCategory[] = [
  'required',
  'core_elective',
  'free_elective',
  'physical_education',
  'general_education',
  'core_general',
];

export default function CourseSearchBar({
  onAdd,
  courses,
  semesterFilter = '全部',
  onSemesterChange,
  categoryFilter = '全部',
  onCategoryChange,
  semesters = [],
  allSemesters = '全部',
  allCategories = '全部',
}: CourseSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const courseList = courses ?? defaultCourses;

  useEffect(() => {
    return () => { if (blurTimer.current) clearTimeout(blurTimer.current); };
  }, []);

  const filtered = query.trim()
    ? courseList.filter(
        (c) =>
          c.name.toLowerCase().includes(normalizedQuery) ||
          c.code.toLowerCase().includes(normalizedQuery)
      )
    : [];

  const hasActiveFilters = semesterFilter !== allSemesters || categoryFilter !== allCategories;

  function handleSelect(course: Course) {
    onAdd(course);
    setQuery('');
    setShowDropdown(false);
  }

  return (
    <div className="mb-6 space-y-2">
      <div
        className="flex items-center gap-3 rounded-2xl px-5 py-4"
        style={glassInput}
      >
        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => {
            blurTimer.current = setTimeout(() => {
              setShowDropdown(false);
              setQuery('');
            }, 150);
          }}
          placeholder="搜尋課程代碼或名稱..."
          className="flex-1 bg-transparent outline-none text-base placeholder-gray-300 rainbow-text"
          aria-label="搜尋並新增課程"
          aria-expanded={showDropdown && filtered.length > 0}
          aria-controls="course-search-dropdown"
          role="combobox"
          aria-autocomplete="list"
        />
        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all"
          style={{
            ...glassButton,
            color: hasActiveFilters ? '#036eb8' : '#6b7280',
          }}
          aria-label="篩選"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round" />
          </svg>
          篩選
          {hasActiveFilters && (
            <span
              className="ml-0.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: '#036eb8' }}
            />
          )}
          <svg
            className="w-3 h-3 transition-transform"
            style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {showDropdown && filtered.length > 0 && (
        <div
          id="course-search-dropdown"
          role="listbox"
          aria-label="課程搜尋結果"
          className="rounded-2xl overflow-hidden"
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
              role="option"
              aria-selected={false}
              className="w-full flex items-center justify-between px-5 py-3 text-sm hover:bg-blue-50 transition-colors text-left"
            >
              <span className="text-gray-700 font-medium">{course.name}</span>
              <span className="text-gray-400">{course.code} · {course.credits} 學分</span>
            </button>
          ))}
        </div>
      )}

      {showFilters && (
        <div
          className="grid grid-cols-2 gap-3 rounded-2xl px-5 py-4"
          style={filterPanelStyle}
        >
          <div>
            <p className="mb-2 text-xs font-medium text-gray-400">學期</p>
            <select
              value={semesterFilter}
              onChange={(e) => onSemesterChange?.(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors"
              style={selectStyle}
            >
              <option value={allSemesters}>全部</option>
              {semesters.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-gray-400">類別</p>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange?.(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none transition-colors"
              style={selectStyle}
            >
              <option value={allCategories}>全部</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{getCourseCategoryLabel(cat)}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
