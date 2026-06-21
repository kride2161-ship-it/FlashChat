/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, Copy, Key, Sparkles, Check } from 'lucide-react';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCode: string; // The active user's code
  onAddContact: (contactCode: string) => boolean | Promise<boolean>; // returns true if successful
  onTriggerToast: (message: string, type: 'success' | 'info' | 'warning' | 'error' | 'copy') => void;
  isDarkMode: boolean;
}

export default function AddContactModal({
  isOpen,
  onClose,
  userCode,
  onAddContact,
  onTriggerToast,
  isDarkMode
}: AddContactModalProps) {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showYourCode, setShowYourCode] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    onTriggerToast('Ваш контактный код успешно скопирован в буфер обмена! 🎉', 'copy');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim().replace(/\s/g, '');
    if (!cleanCode) {
      onTriggerToast('Пожалуйста, введите корректный 14-значный код контакта.', 'warning');
      return;
    }

    if (cleanCode === userCode) {
      onTriggerToast('Вы не можете добавить самого себя в список контактов! 😊', 'info');
      return;
    }

    const success = await onAddContact(cleanCode);
    if (success) {
      setInputCode('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
      />

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-md p-6 rounded-3xl backdrop-blur-3xl shadow-2xl z-10 ${
          isDarkMode 
            ? 'bg-[#0F172A]/90 border border-white/10 text-white shadow-black/60' 
            : 'bg-white/95 border border-slate-200 text-slate-900 shadow-slate-300/50'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2D6BFF]/10 text-[#2D6BFF]">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Добавить контакт</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl hover:scale-105 active:scale-95 transition-all ${
              isDarkMode ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Введите код контакта
            </label>
            <div className="relative">
              <Key className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                maxLength={18}
                placeholder="03726329136127"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-semibold tracking-wider font-mono transition-all focus:outline-none ${
                  isDarkMode
                    ? 'bg-slate-950/50 border-white/8 text-white placeholder-slate-700 focus:border-[#2D6BFF] focus:bg-slate-950'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#2D6BFF] focus:bg-white'
                }`}
              />
            </div>
            <span className={`block text-[10px] mt-1.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              💡 Чтобы протестировать реальное общение, вы можете открыть мессенджер во второй вкладке браузера под другим именем и добавить этот контакт!
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-white font-semibold text-sm bg-[#2D6BFF] hover:bg-[#1E50FF] active:scale-[0.98] transition-all shadow-lg shadow-[#2D6BFF]/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Добавить контакт
          </button>
        </form>

        <div className={`my-5 border-t ${isDarkMode ? 'border-white/8' : 'border-slate-100'}`} />

        {/* Your Contact toggle info section */}
        <div>
          <button
            onClick={() => setShowYourCode(!showYourCode)}
            className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between font-semibold text-sm transition-all border ${
              isDarkMode 
                ? 'bg-white/5 border-white/8 hover:bg-white/10 text-slate-200' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2D6BFF]" />
              Кнопка "Ваш контакт"
            </span>
            <span className="text-xs font-bold text-[#2D6BFF]">
              {showYourCode ? 'Свернуть' : 'Показать'}
            </span>
          </button>

          <AnimatePresence>
            {showYourCode && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className={`overflow-hidden rounded-2xl p-4 border relative ${
                  isDarkMode 
                    ? 'bg-slate-950/60 border-white/5 text-slate-300' 
                    : 'bg-blue-50/50 border-blue-100/60 text-slate-700'
                }`}
              >
                <p className="text-xs font-semibold mb-1 text-[#2D6BFF]">Ваш уникальный код:</p>
                <div className="flex items-center justify-between gap-3 bg-white/5 dark:bg-black/25 rounded-xl py-2 px-3 border border-white/5 font-mono text-sm tracking-wider font-bold select-all">
                  <span>{userCode}</span>
                  <button
                    onClick={handleCopyCode}
                    type="button"
                    className="p-1.5 rounded-lg bg-[#2D6BFF] text-white hover:bg-[#1E50FF] transition-all active:scale-95"
                    title="Скопировать"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className={`text-[10px] mt-2 leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Отправьте этот код друзьям, чтобы они смогли добавить вас в свой список контактов!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
