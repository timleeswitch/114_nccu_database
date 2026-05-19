interface Feature {
  icon: string;
  title: string;
  description: string;
  decoration: 'bars' | 'checks' | 'grid' | 'stars';
}

const features: Feature[] = [
  {
    icon: '📊',
    title: '追蹤學分進度',
    description: '依類別檢視所有已修學分——必修、選修與通識一目瞭然。',
    decoration: 'bars',
  },
  {
    icon: '📋',
    title: '查看畢業門檻',
    description: '精確掌握還需修哪些課程，確保順利達成畢業條件。',
    decoration: 'checks',
  },
  {
    icon: '📅',
    title: '提前規劃課表',
    description: '安排剩餘學期的修課計畫，讓畢業時程始終在掌握之中。',
    decoration: 'grid',
  },
  {
    icon: '🎓',
    title: '準時順利畢業',
    description: '清楚知道你的畢業日期，不再有意外，只有踏實的前進。',
    decoration: 'stars',
  },
];

function Illustration({ decoration, icon }: { decoration: Feature['decoration']; icon: string }) {
  return (
    <div
      className="h-44 rounded-t-2xl flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#dbeeff' }}
    >
      {decoration === 'bars' && (
        <>
          <div className="absolute bottom-6 left-8 flex items-end gap-2">
            {[60, 85, 45, 90, 70].map((h, i) => (
              <div key={i} className="w-4 rounded-t-sm" style={{ height: `${h * 0.5}px`, backgroundColor: '#036eb8', opacity: 0.2 + i * 0.15 }} />
            ))}
          </div>
          <div className="absolute top-5 right-6 w-14 h-14 rounded-full opacity-15" style={{ backgroundColor: '#036eb8' }} />
        </>
      )}
      {decoration === 'checks' && (
        <>
          <div className="absolute top-5 left-8 flex flex-col gap-2">
            {[true, true, false].map((done, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded flex items-center justify-center text-white text-xs" style={{ backgroundColor: done ? '#036eb8' : 'transparent', border: done ? 'none' : '1.5px solid #93c5fd' }}>
                  {done ? '✓' : ''}
                </div>
                <div className="h-2 rounded-full" style={{ width: `${48 + i * 16}px`, backgroundColor: '#93c5fd', opacity: 0.5 }} />
              </div>
            ))}
          </div>
          <div className="absolute bottom-4 right-6 w-10 h-10 rounded-full opacity-20" style={{ backgroundColor: '#036eb8' }} />
        </>
      )}
      {decoration === 'grid' && (
        <>
          <div className="absolute top-5 left-7 grid grid-cols-4 gap-1.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded" style={{ backgroundColor: '#036eb8', opacity: i < 10 ? 0.6 : 0.15 }} />
            ))}
          </div>
        </>
      )}
      {decoration === 'stars' && (
        <>
          <div className="absolute top-4 left-10 text-2xl opacity-40">✦</div>
          <div className="absolute top-8 right-10 text-xl opacity-30">✦</div>
          <div className="absolute bottom-6 left-16 text-3xl opacity-20">✦</div>
          <div className="absolute bottom-4 right-8 w-12 h-12 rounded-full opacity-20" style={{ backgroundColor: '#036eb8' }} />
        </>
      )}
      <span className="text-4xl z-10">{icon}</span>
    </div>
  );
}

interface FeaturesSectionProps {}

export default function FeaturesSection({}: FeaturesSectionProps) {
  return (
    <section id="features" className="px-6 md:px-16 pt-12 pb-0 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">還有多少學分可以畢業？</h2>
      <p className="mt-3 text-gray-500 max-w-md mx-auto">
        立即登入，查看自己距離畢業門檻還有多少哩程<br /> 輕易掌握學分，確保順利畢業
      </p>
    </section>
  );
}
