import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import profileIcon from '../assets/profile_icon.png';

export default function ProfileMenu() {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent): void {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  function handleLogout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('student_id');
    navigate('/');
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="開啟個人選單"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-gray-300/80 bg-white/70 shadow-md transition-all hover:-translate-y-0.5 hover:border-gray-400/80 hover:bg-white"
      >
        <img
          alt="個人頭像"
          className="h-14 w-14 rounded-full border border-gray-200 object-cover"
          src={profileIcon}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-3 w-36 overflow-hidden rounded-2xl border border-white/80 bg-white/90 p-2 shadow-xl backdrop-blur">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            登出
          </button>
        </div>
      )}
    </div>
  );
}
