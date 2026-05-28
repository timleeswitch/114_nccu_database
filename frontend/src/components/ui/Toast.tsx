import { useEffect, useRef } from 'react';
import Button from './Button';

export type ToastTone = 'success' | 'error';

interface ToastProps {
  message: string;
  tone?: ToastTone;
  onClose: () => void;
}

const toneStyles: Record<ToastTone, { accent: string; label: string }> = {
  success: {
    accent: '#036eb8',
    label: '完成',
  },
  error: {
    accent: '#dc2626',
    label: '提醒',
  },
};

export default function Toast({ message, tone = 'success', onClose }: ToastProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const timer = window.setTimeout(() => onCloseRef.current(), 3200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message, tone]);

  const style = toneStyles[tone];

  return (
    <div className="fixed right-5 top-5 z-[60] w-[calc(100vw-2.5rem)] max-w-sm">
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-4 shadow-xl backdrop-blur-2xl"
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
        }}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1 h-9 w-1.5 rounded-full" style={{ backgroundColor: style.accent }} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{style.label}</p>
            <p className="mt-1 text-sm leading-5 text-gray-600">{message}</p>
          </div>
          <Button className="px-3 py-2 text-xs" variant="ghost" onClick={onClose}>
            關閉
          </Button>
        </div>
      </div>
    </div>
  );
}
