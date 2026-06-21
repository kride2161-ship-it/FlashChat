/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Edit3, Moon, Sun, Shield, Power } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  profileUsername: string;
  profileStatus: string;
  avatarBg: string;
  isOnline: boolean;
  isDarkMode: boolean;
  onUpdateProfile: (name: string, status: string, avatarBg: string, isOnline: boolean) => void;
  onToggleTheme: () => void;
  isGuest: boolean;
  onLogout: () => void;
}

const AVATAR_COLORS = [
  '#2D6BFF', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#6366F1'
];

export default function UserProfileModal({
  isOpen,
  onClose,
  profileName,
  profileUsername,
  profileStatus,
  avatarBg,
  isOnline,
  isDarkMode,
  onUpdateProfile,
  onToggleTheme,
  isGuest,
  onLogout
}: UserProfileModalProps) {
  const [name, setName] = useState(profileName);
  const [status, setStatus] = useState(profileStatus);
  const [bg, setBg] = useState(avatarBg);
  const [online, setOnline] = useState(isOnline);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(name.trim() || profileName, status.trim(), bg, online);
    onClose();
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
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Настройки профиля</h3>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar and Info Grid */}
          <div className="flex items-center gap-4 py-2">
            <div 
              style={{ backgroundColor: bg }} 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black relative shadow-md"
            >
              {name.slice(0, 2).toUpperCase()}
              <div className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-3 ${isDarkMode ? 'border-[#0F172A]' : 'border-white'} ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </div>

            <div className="flex-1">
              <h4 className="font-bold text-sm leading-snug">{name}</h4>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>@{profileUsername}</p>
              <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-bold ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                {online ? 'В сети' : 'Невидимка'}
              </span>
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Имя на замену
            </label>
            <div className="relative">
              <Edit3 className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition-all focus:outline-none ${
                  isDarkMode
                    ? 'bg-slate-950/50 border-white/8 text-white focus:border-[#2D6BFF]'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#2D6BFF]'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Ваш статус / О себе
            </label>
            <input
              type="text"
              placeholder="Укажите статус..."
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all focus:outline-none ${
                isDarkMode
                  ? 'bg-slate-950/50 border-white/8 text-white focus:border-[#2D6BFF]'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#2D6BFF]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Сменить цвет аватара
            </label>
            <div className="flex gap-2.5 mt-2 justify-center py-1">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBg(color)}
                  style={{ backgroundColor: color }}
                  className={`w-6 h-6 rounded-lg transition-all relative ${
                    bg === color ? 'ring-2 ring-offset-2 ring-[#2D6BFF] scale-110' : 'hover:scale-105 opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Online Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-b border-slate-100 dark:border-white/5">
            <span className="text-sm font-bold flex items-center gap-2">
              <Power className="w-4 h-4 text-[#2D6BFF]" />
              Показывать статус "В сети"
            </span>
            <button
              type="button"
              onClick={() => setOnline(!online)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${online ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${online ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Theme switcher directly in Profile settings */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-sm font-bold flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              Тёмная тема оформления
            </span>
            <button
              type="button"
              onClick={onToggleTheme}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer ${isDarkMode ? 'bg-[#2D6BFF]' : 'bg-slate-300 dark:bg-slate-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onLogout}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-xs transition-all border ${
                isDarkMode 
                  ? 'border-rose-500/20 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20' 
                  : 'border-rose-100 text-rose-600 bg-rose-50 hover:bg-rose-100'
              }`}
            >
              Выйти из профиля
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-white font-semibold text-xs bg-[#2D6BFF] hover:bg-[#1E50FF] transition-all hover:shadow-lg hover:shadow-[#2D6BFF]/10 cursor-pointer"
            >
              Сохранить изменения
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
