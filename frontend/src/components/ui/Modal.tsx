import { useEffect, useId, useRef } from 'react';
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
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const dialog = dialogRef.current;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    function getFocusableElements(): HTMLElement[] {
      if (!dialog) {
        return [];
      }

      return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
        .filter((element) => element.offsetParent !== null);
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.setTimeout(() => {
      const [firstElement] = getFocusableElements();
      (firstElement ?? dialog)?.focus();
    }, 0);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 px-4 py-8 backdrop-blur-sm">
      <Card
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-4xl"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between border-b border-white/60 px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-900" id={titleId}>{title}</h2>
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
