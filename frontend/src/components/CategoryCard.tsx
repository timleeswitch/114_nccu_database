import ProgressBar from './ProgressBar';

export interface CreditCategory {
  name: string;
  completed: number;
  required: number;
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.6)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
};

interface CategoryCardProps {
  category: CreditCategory;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const { name, completed, required } = category;
  const remaining = required - completed;
  const done = completed >= required;

  return (
    <div className="rounded-2xl px-6 py-5" style={glassCard}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-semibold text-gray-800">{name}</span>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={done
            ? { background: '#dcfce7', color: '#7BBA99' }
            : { background: '#dbeafe', color: '#6b8cba' }}
        >
          {done ? '已完成' : `還差 ${remaining} 學分`}
        </span>
      </div>
      <ProgressBar completed={completed} required={required} />
      <div className="flex justify-between mt-2">
        <span className="text-sm text-gray-400">已修 {completed} 學分</span>
        <span className="text-sm text-gray-400">需修 {required} 學分</span>
      </div>
    </div>
  );
}
