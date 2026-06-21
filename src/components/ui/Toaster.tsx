import React from 'react';

type ToastType = 'success' | 'error' | 'info';
type ToastListener = (message: string, type: ToastType) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success: (message: string) => {
    console.log('[SUCCESS TOAST]', message);
    listeners.forEach((listener) => listener(message, 'success'));
  },
  error: (message: string) => {
    console.log('[ERROR TOAST]', message);
    listeners.forEach((listener) => listener(message, 'error'));
  },
  info: (message: string) => {
    console.log('[INFO TOAST]', message);
    listeners.forEach((listener) => listener(message, 'info'));
  },
  subscribe: (listener: ToastListener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};

export function Toaster() {
  const [activeToasts, setActiveToasts] = React.useState<{ id: number; message: string; type: ToastType }[]>([]);

  React.useEffect(() => {
    return toast.subscribe((message, type) => {
      const id = Date.now();
      setActiveToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    });
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-55 flex flex-col gap-2 max-w-sm pointer-events-none">
      {activeToasts.map((t) => (
        <div
          key={t.id}
          className={`p-4 rounded-xl shadow-lg border transition-all duration-300 pointer-events-auto flex items-center justify-between gap-3 text-sm animate-fade-in ${
            t.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/85 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : t.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/85 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
              : 'bg-amber-50 dark:bg-amber-950/85 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800'
          }`}
        >
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
