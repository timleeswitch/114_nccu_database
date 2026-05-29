import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import type { LoginPayload } from '../services/studentService';

interface AuthSectionProps {
  onLogin: (payload: LoginPayload) => Promise<void>;
}

export default function AuthSection({ onLogin }: AuthSectionProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [studentId, setStudentId] = useState('1');
  const [password, setPassword] = useState('password');
  const [authError, setAuthError] = useState('');

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setAuthError('');

    try {
      await onLogin({ studentId, password });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : '登入失敗，請稍後再試。');
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
          boxShadow: '0 4px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.1)',
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
          <form className="relative flex flex-col gap-5" onSubmit={handleLoginSubmit}>
            <Input
              label="學號"
              placeholder="請輸入學號"
              type="text"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
            />
            <Input
              label="密碼"
              placeholder="請輸入密碼"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {authError && (
              <p className="rounded-2xl bg-red-50/90 px-4 py-3 text-sm text-red-600">
                {authError}
              </p>
            )}
            <Button className="mt-3 w-full py-4 text-base" type="submit">
              登入
            </Button>
          </form>
        ) : (
          <div className="relative flex flex-col gap-5">
            <Input label="學號" placeholder="請輸入學號" type="text" />
            <Input label="Email" placeholder="請輸入學校 Email" type="email" />
            <Input label="密碼" placeholder="請設定密碼" type="password" />
            <Button className="mt-3 w-full py-4 text-base">
              註冊
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
