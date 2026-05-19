interface HeroSectionProps {}

export default function HeroSection({}: HeroSectionProps) {
  return (
    <section className="px-6 md:px-16 pt-10 pb-0 text-center">
      <div className="relative inline-block"></div>

      <div className="relative inline-block">
        <div className="absolute -left-24 -top-6 w-20 h-20 rounded-full bg-gray-100 items-center justify-center hidden md:flex" style={{ fontSize: '44px', transform: 'rotate(-15deg)' }}>
          🎓
        </div>
        <div className="absolute -right-24 -bottom-4 w-14 h-14 rounded-full bg-gray-100 items-center justify-center hidden md:flex" style={{ fontSize: '28px', transform: 'rotate(10deg)' }}>
          🎉
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-gray-900 leading-tight max-w-2xl mx-auto">
          政大資訊科學系<br />畢業學分檢核系統
        </h1>
      </div>
      <p className="mt-4 text-gray-500 text-base max-w-sm mx-auto leading-relaxed">
        查看已修學分紀錄、畢業剩餘學分<br />一目瞭然規劃你的畢業航線。
      </p>

      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          className="px-6 py-3 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
          style={{ backgroundColor: '#036eb8' }}
        >
          查看我的進度
        </button>
      </div>

      {/* Single overview card */}
      <div className="mt-10 mx-auto max-w-2xl bg-white rounded-3xl shadow-xl px-12 py-8 text-left">
        <div className="flex items-center gap-8">
          {/* Large two-arc donut */}
          <svg viewBox="0 0 120 120" className="w-36 h-36 shrink-0">
            <defs>
              <linearGradient id="donutGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a8cceb" />
                <stop offset="100%" stopColor="#5a9fd4" />
              </linearGradient>
            </defs>
            <circle
              cx="60" cy="60" r="46"
              fill="none" stroke="#ddeeff" strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46 * (1 - 108 / 128) - 5} ${2 * Math.PI * 46 * (108 / 128) + 5}`}
              transform={`rotate(${-90 + (108 / 128) * 360} 60 60)`}
            />
            <circle
              cx="60" cy="60" r="46"
              fill="none" stroke="url(#donutGrad)" strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46 * (108 / 128) - 5} ${2 * Math.PI * 46 * (1 - 108 / 128) + 5}`}
              transform="rotate(-90 60 60)"
            />
          </svg>

          {/* Pill divider */}
          <div className="w-px h-20 rounded-full bg-gray-100 shrink-0" />

          {/* Label + number */}
          <div className="flex-1">
            <p className="text-xl text-gray-400 mb-2">已修習學分</p>
            <p className="leading-none">
              <span className="text-6xl font-bold" style={{ color: '#6b8cba' }}>108</span>
              <span className="text-3xl text-gray-400 ml-2">/ 128</span>
            </p>
          </div>

          {/* Thumbs up */}
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center shrink-0" style={{ fontSize: '48px' }}>
            👍
          </div>
        </div>
      </div>
    </section>
  );
}
