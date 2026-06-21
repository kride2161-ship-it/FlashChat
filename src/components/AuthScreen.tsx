/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Key, Sparkles, LogIn, ArrowRight } from 'lucide-react';
import Logo from './Logo';

interface AuthScreenProps {
  onRegisterSuccess: (username: string, name: string, seed: string, avatarBg: string) => void;
  isDarkMode: boolean;
}

const AVATAR_COLORS = [
  '#2D6BFF', // Brand Blue
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1'  // Indigo
];

export default function AuthScreen({ onRegisterSuccess, isDarkMode }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBg, setSelectedBg] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Пожалуйста, введите имя пользователя (логин)');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Пожалуйста, введите ваше настоящее имя');
      return;
    }
    if (password.length < 4) {
      setError('Пароль должен содержать не менее 4 символов');
      return;
    }

    // Dynamic initials seed based on name
    const finalName = isLogin ? username : name;
    onRegisterSuccess(
      username.trim().toLowerCase(),
      finalName,
      username.trim().slice(0, 2).toUpperCase(),
      selectedBg
    );
  };

  const handleQuickDemo = () => {
    onRegisterSuccess(
      'super_user',
      'Никита Вершинин',
      'НВ',
      '#2D6BFF'
    );
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'app-bg-gradient-dark' : 'app-bg-gradient-light'}`}>
      {/* Decorative Blur Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#2D6BFF]/20 blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#00C6FF]/15 blur-3xl animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-md p-8 rounded-3xl backdrop-blur-3xl shadow-2xl relative z-10 ${
          isDarkMode ? 'bg-[#0F172A]/70 border border-white/8 shadow-black/40' : 'bg-white/70 border border-white/40 shadow-blue-900/10'
        }`}
      >
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" className="mb-2" />
          <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isLogin ? 'С возвращением в FlashChat!' : 'Присоединяйтесь к чату нового поколения'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Имя пользователя (логин)
            </label>
            <div className="relative">
              <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="например, alex_99"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium transition-all focus:outline-none ${
                  isDarkMode
                    ? 'bg-slate-950/40 border-white/8 text-white placeholder-slate-600 focus:border-[#2D6BFF] focus:bg-slate-950/60'
                    : 'bg-white/60 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#2D6BFF] focus:bg-white'
                }`}
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Ваше имя
              </label>
              <div className="relative">
                <Sparkles className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium transition-all focus:outline-none ${
                    isDarkMode
                      ? 'bg-slate-950/40 border-white/8 text-white placeholder-slate-600 focus:border-[#2D6BFF] focus:bg-slate-950/60'
                      : 'bg-white/60 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#2D6BFF] focus:bg-white'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Пароль
            </label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-medium transition-all focus:outline-none ${
                  isDarkMode
                    ? 'bg-slate-950/40 border-white/8 text-white placeholder-slate-600 focus:border-[#2D6BFF] focus:bg-slate-950/60'
                    : 'bg-white/60 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#2D6BFF] focus:bg-white'
                }`}
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Цвет аватара профиля
              </label>
              <div className="flex gap-2.5 mt-2 justify-center py-1">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedBg(color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-xl transition-all relative ${
                      selectedBg === color 
                        ? 'ring-2 ring-offset-2 ring-[#2D6BFF] scale-110' 
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-3.5 rounded-2xl text-white font-semibold text-sm bg-gradient-to-r from-[#1E50FF] to-[#00A3FF] hover:opacity-95 shadow-lg shadow-[#2D6BFF]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLogin ? (
              <>
                Войти в FlashChat <LogIn className="w-4 h-4" />
              </>
            ) : (
              <>
                Зарегистрироваться <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className={`text-xs font-semibold hover:underline ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'}`}
          >
            {isLogin ? 'Создать новый аккаунт FlashChat' : 'Уже зарегистрированы? Войти'}
          </button>

          <span className={`text-[10px] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Или</span>

          <button
            type="button"
            onClick={handleQuickDemo}
            className={`text-xs px-4 py-1.5 rounded-full border flex items-center gap-1.5 font-semibold transition-all ${
              isDarkMode 
                ? 'border-white/10 hover:border-[#2D6BFF]/50 text-slate-300 bg-white/5 hover:bg-white/10' 
                : 'border-slate-200 hover:border-[#2D6BFF]/50 text-slate-600 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Войти как гость (Быстрое демо) <Sparkles className="w-3 h-3 text-[#2D6BFF]" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
