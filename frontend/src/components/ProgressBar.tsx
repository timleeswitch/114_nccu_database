interface ProgressBarProps {
  completed: number;
  required: number;
}

export default function ProgressBar({ completed, required }: ProgressBarProps) {
  const pct = Math.min((completed / required) * 100, 100);
  const done = completed >= required;
  return (
    <div className="w-full h-2.5 rounded-full bg-blue-50 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: done ? '#9FE2BF' : 'linear-gradient(90deg, #aacde8, #5a9fd4)',
        }}
      />
    </div>
  );
}
