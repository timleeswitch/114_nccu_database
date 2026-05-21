import type { ReactNode } from 'react';
import Button from './Button';
import Card from './Card';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  title: string;
  footer?: ReactNode;
  onClose: () => void;
}

export default function Modal({ children, isOpen, title, footer, onClose }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4 py-8 backdrop-blur-sm">
      <Card className="max-h-[90vh] w-full max-w-4xl">
        <div className="flex items-center justify-between border-b border-white/60 px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <Button aria-label="關閉視窗" className="px-3 py-2" variant="ghost" onClick={onClose}>
            關閉
          </Button>
        </div>
        <div className="max-h-[62vh] overflow-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-white/60 px-6 py-5">{footer}</div>}
      </Card>
    </div>
  );
}
