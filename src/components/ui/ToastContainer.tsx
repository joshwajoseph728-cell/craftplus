import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md animate-slide-up transition-all text-sm',
              'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100',
              isSuccess && 'border-emerald-500/40 dark:border-emerald-500/30',
              isWarning && 'border-amber-500/40 dark:border-amber-500/30',
              !isSuccess && !isWarning && 'border-brand-500/30 dark:border-brand-500/20'
            )}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {isWarning && <AlertCircle className="w-5 h-5 text-amber-500" />}
              {!isSuccess && !isWarning && <Info className="w-5 h-5 text-brand-500" />}
            </div>

            <div className="flex-1 pr-1">
              <h4 className="font-bold text-xs leading-none mb-1 text-slate-900 dark:text-white">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

