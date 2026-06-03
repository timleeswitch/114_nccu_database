import { useState } from 'react';

const inputStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.74)',
  border: '1px solid rgba(255,255,255,0.6)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

export default function AuthSection() {
  const [tab, setTab] = useState<'login' | 'register'>('login');

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
          <div className="relative flex flex-col gap-5">
            <div>
              <label className="block text-base text-gray-600 mb-2">學號</label>
              <input type="text" placeholder="請輸入學號"
                className="w-full px-5 py-4 rounded-xl text-base text-gray-700 outline-none transition-colors"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-base text-gray-600 mb-2">密碼</label>
              <input type="password" placeholder="請輸入密碼"
                className="w-full px-5 py-4 rounded-xl text-base text-gray-700 outline-none transition-colors"
                style={inputStyle} />
            </div>
            <button
              className="mt-3 w-full py-4 rounded-xl text-white text-base font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#036eb8' }}
            >
              登入
            </button>
          </div>
        ) : (
          <div className="relative flex flex-col gap-5">
            <div>
              <label className="block text-base text-gray-600 mb-2">學號</label>
              <input type="text" placeholder="請輸入學號"
                className="w-full px-5 py-4 rounded-xl text-base text-gray-700 outline-none transition-colors"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-base text-gray-600 mb-2">Email</label>
              <input type="email" placeholder="請輸入學校 Email"
                className="w-full px-5 py-4 rounded-xl text-base text-gray-700 outline-none transition-colors"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-base text-gray-600 mb-2">密碼</label>
              <input type="password" placeholder="請設定密碼"
                className="w-full px-5 py-4 rounded-xl text-base text-gray-700 outline-none transition-colors"
                style={inputStyle} />
            </div>
            <button
              className="mt-3 w-full py-4 rounded-xl text-white text-base font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#036eb8' }}
            >
              註冊
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
