/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Info, AlertTriangle, XCircle, Copy } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'copy';
}

interface ToastProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastCardProps {
  key?: React.Key;
  toast: ToastItem;
  onClose: () => void;
}

function ToastCard({ toast, onClose }: ToastCardProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
      icon: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
    },
    copy: {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      icon: <Copy className="w-5 h-5 text-indigo-500 shrink-0" />
    }
  };

  const { bg, icon } = config[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      layout
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl shadow-lg shadow-black/5 ${bg} w-full`}
    >
      {icon}
      <p className="text-sm font-semibold flex-1 leading-snug">{toast.message}</p>
      <button 
        onClick={onClose} 
        className="opacity-50 hover:opacity-100 transition-opacity p-0.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </motion.div>
  );
}
