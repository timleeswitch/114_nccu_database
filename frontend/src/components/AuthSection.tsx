import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://127.0.0.1:8000';

const inputStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.74)',
  border: '1px solid rgba(255,255,255,0.6)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

export default function AuthSection() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: Number(studentId),
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? '登入失敗');
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('student_id', studentId);
      navigate('/records');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '登入失敗');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: Number(studentId),
          name,
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ?? '註冊失敗');
      }

      localStorage.setItem('access_token', data.access_token);
      setMessage('註冊成功，資料已儲存至資料庫。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '註冊失敗');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="px-6 md:px-16 py-12 flex justify-center">
      <div
        className="relative w-full max-w-3xl rounded-3xl px-14 py-12 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.45)',
          boxShadow: '0 8px 32px rgba(100,140,180,0.2), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -2px 4px rgba(0,0,0,0.04)',
        }}
      >
        {/* Specular highlight */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 40%, transparent 65%)' }}
        />

        {/* Tabs */}
        <div
          className="relative flex gap-1 rounded-xl p-1 mb-10 w-fit"
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-8 py-2.5 rounded-lg text-base font-medium transition-all"
              style={tab === t ? { backgroundColor: '#036eb8', color: '#fff' } : { color: '#4b5563' }}
            >
              {t === 'login' ? '登入' : '註冊'}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <form className="relative flex flex-col gap-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-base text-gray-600 mb-2">學號</label>
              <input
                type="number"
                min="1"
                required
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                placeholder="請輸入學號"
                className="w-full px-5 py-4 rounded-xl text-base text-gray-700 outline-none transition-colors"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-base text-gray-600 mb-2">密碼</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="請輸入密碼"
                className="w-full px-5 py-4 rounded-xl text-base text-gray-700 outline-none transition-colors"
                style={inputStyle} />
            </div>
            {message && (
              <p className="text-sm text-gray-700" role="status">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full py-4 rounded-xl text-white text-base font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#036eb8' }}
            >
              {isSubmitting ? '登入中...' : '登入'}
            </button>
          </form>
        ) : (
          <form className="relative flex flex-col gap-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-base text-gray-600 mb-2">學號</label>
              <input
                type="number"
                min="1"
                required
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                placeholder="請輸入學號"
                className="w-full px-5 py-4 rounded-xl text-base text-gray-700 outline-none transition-colors"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-base text-gray-600 mb-2">姓名</label>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="請輸入姓名"
                className="w-full px-5 py-4 rounded-xl text-base text-gray-700 outline-none transition-colors"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-base text-gray-600 mb-2">密碼</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="請設定密碼"
                className="w-full px-5 py-4 rounded-xl text-base text-gray-700 outline-none transition-colors"
                style={inputStyle} />
            </div>
            {message && (
              <p className="text-sm text-gray-700" role="status">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full py-4 rounded-xl text-white text-base font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#036eb8' }}
            >
              {isSubmitting ? '註冊中...' : '註冊'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
