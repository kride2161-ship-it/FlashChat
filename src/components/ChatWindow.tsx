/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Contact, Message, UserProfile } from '../types';
import { 
  Send, Paperclip, Smile, Search, MoreVertical, Trash2, 
  User, CheckCheck, Check, Image, FileText, CornerDownRight, 
  Users, MessageSquare, Flame, HelpCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  currentUser: UserProfile;
  isDarkMode: boolean;
  onSendMessage: (text: string, attachment?: { type: 'image' | 'file'; url: string; name: string }) => void;
  onClearHistory: (contactId: string) => void;
  onTriggerToast: (message: string, type: 'success' | 'info' | 'warning' | 'error' | 'copy') => void;
}

const COMMON_EMOJIS = ['👍', '🔥', '❤️', '😂', '🎉', '🚀', '💻', '🙌', '😄', '🤔', '👀', '✨'];

export default function ChatWindow({
  contact,
  messages,
  currentUser,
  isDarkMode,
  onSendMessage,
  onClearHistory,
  onTriggerToast
}: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Custom attachment state (highly immersive!)
  const [pendingAttachment, setPendingAttachment] = useState<{
    type: 'image' | 'file';
    url: string;
    name: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, contact?.typing]);

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !pendingAttachment) return;

    onSendMessage(inputText, pendingAttachment || undefined);
    setInputText('');
    setPendingAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    
    // Create a temporary object URL to simulate uploads
    const fakeUrl = URL.createObjectURL(file);
    
    setPendingAttachment({
      type: isImage ? 'image' : 'file',
      url: fakeUrl,
      name: file.name
    });

    onTriggerToast(`Файл "${file.name}" подготовлен к отправке! 📎`, 'info');
  };

  const clearAttachment = () => {
    setPendingAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Pre-configured simulation attach actions
  const handleSimulatedImage = (imgUrl: string, name: string) => {
    setPendingAttachment({
      type: 'image',
      url: imgUrl,
      name: name
    });
    onTriggerToast('Прикреплен макет интерфейса FlashChat 🖼️', 'success');
  };

  if (!contact) {
    // Elegant welcome splash screen when no chat is active
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center transition-all ${
        isDarkMode ? 'bg-[#0F172A]/40' : 'bg-slate-50/40'
      }`}>
        {/* Animated Brand Emblem */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#1E50FF] to-[#01F6FF] flex items-center justify-center shadow-2xl shadow-[#2D6BFF]/20 mb-8"
        >
          <div className="absolute inset-0 rounded-3xl bg-[#2D6BFF]/30 blur-xl animate-pulse" />
          <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </motion.div>

        <h2 className="text-2xl font-black mb-2 select-none">Добро пожаловать во FlashChat!</h2>
        <p className={`text-sm max-w-sm mb-6 font-semibold select-none leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Выберите любой чат слева или добавьте нового друга, нажав на кнопку "Добавить" для мгновенной переписки!
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
          <div className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
            isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-2 rounded-xl bg-[#2D6BFF]/10 text-[#2D6BFF]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold mb-0.5">Супер-быстрые сообщения</p>
              <p className="text-[10px] text-slate-400">Мгновенный обмен данными без задержек.</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
            isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold mb-0.5">Встроенные стикеры и эмотиконы</p>
              <p className="text-[10px] text-slate-400">Быстрый выбор любимых смайликов одной кнопкой.</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
            isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold mb-0.5">Система контактов 14-dig</p>
              <p className="text-[10px] text-slate-400">Генерация цифровых кодов для защиты приватности.</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
            isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold mb-0.5">Персональные Темы</p>
              <p className="text-[10px] text-slate-400">Идеальная адаптация под светлую или темную тему.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950/20' : 'bg-slate-100/30'
    }`}>
      
      {/* Active Conversation Header */}
      <div className={`px-6 py-4.5 border-b flex items-center justify-between select-none relative z-10 ${
        isDarkMode ? 'bg-[#0B1120]/90 border-white/8' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="relative">
            <div 
              style={{ backgroundColor: contact.avatarBg }} 
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-sm"
            >
              {contact.name.slice(0, 2).toUpperCase()}
            </div>
            {contact.isOnline && (
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isDarkMode ? 'border-[#0B1120]' : 'border-white'} bg-emerald-500`} />
            )}
          </div>
          
          <div>
            <h4 className="font-bold text-sm leading-tight">{contact.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {contact.typing ? (
                <span className="text-xs text-[#2D6BFF] font-semibold animate-pulse">печатает новые сообщения...</span>
              ) : (
                <>
                  <span className={`w-1.5 h-1.5 rounded-full ${contact.isOnline ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                  <span className={`text-[11px] font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {contact.isOnline ? 'онлайн' : contact.lastSeen || 'не в сети'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action icons / Menu */}
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => onTriggerToast(`Диалог защищен сквозным шифрованием FlashCrypt 🕶️`, 'success')}
            className={`p-2 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-black'
            }`}
            title="Защита информации"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              isDarkMode ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Inline Action list */}
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={`absolute right-0 top-11 w-52 py-1.5 rounded-2xl shadow-xl z-40 border ${
                    isDarkMode 
                      ? 'bg-slate-900 border-white/10 text-white shadow-black/50' 
                      : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
                  }`}
                >
                  <button
                    onClick={() => {
                      onClearHistory(contact.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-500/10 text-rose-500 font-bold text-xs flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Очистить историю чата
                  </button>
                  <div className={`my-1 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`} />
                  <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Информация о собеседнике
                  </div>
                  <div className="px-4 py-1.5 text-xs">
                    <p className="font-semibold">{contact.name}</p>
                    <p className="opacity-50">Код: {contact.code}</p>
                    {contact.statusMessage && (
                      <p className="italic mt-1 text-[11px] opacity-70">"{contact.statusMessage}"</p>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 select-none">
            <div className="p-4 rounded-full bg-[#2D6BFF]/5 mb-3">
              <MessageSquare className="w-8 h-8 text-[#2D6BFF]/40" />
            </div>
            <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>История сообщений пуста</p>
            <p className="text-xs text-slate-500 max-w-xs">Отправьте первое сообщение, чтобы начать потрясающий разговор!</p>
          </div>
        ) : (
          messages.map((message, idx) => {
            const isMe = message.senderId === 'current_user';
            
            return (
              <div 
                key={message.id} 
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] sm:max-w-md md:max-w-lg flex flex-col items-end gap-1 group`}>
                  
                  {/* Speech bubble */}
                  <div className={`px-4 py-2.5 rounded-2xl relative shadow-sm ${
                    isMe 
                      ? 'bg-gradient-to-tr from-[#1E50FF] to-[#01B6FF] text-white rounded-br-sm' 
                      : isDarkMode
                        ? 'bg-slate-900 border border-white/5 text-slate-100 rounded-bl-sm'
                        : 'bg-white border border-slate-100 text-slate-900 rounded-bl-sm'
                  }`}>
                    
                    {/* Attached Image container */}
                    {message.attachmentUrl && message.attachmentType === 'image' && (
                      <div className="mb-2 max-w-full overflow-hidden rounded-xl bg-black/10">
                        <img 
                          referrerPolicy="no-referrer"
                          src={message.attachmentUrl} 
                          alt={message.attachmentName || 'Изображение'} 
                          className="max-h-52 w-full object-cover transition-transform hover:scale-102 cursor-zoom-in"
                        />
                        {message.attachmentName && (
                          <div className={`p-1.5 text-[10px] font-bold truncate ${isMe ? 'bg-blue-800/40 text-blue-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                            {message.attachmentName}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attached File/Document container */}
                    {message.attachmentUrl && message.attachmentType === 'file' && (
                      <div className={`mb-2 p-2.5 rounded-xl flex items-center gap-2.5 border text-xs ${
                        isMe 
                          ? 'bg-blue-900/40 border-blue-800/40 text-blue-100' 
                          : 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-100 dark:border-white/5 text-slate-300'
                      }`}>
                        <FileText className="w-5 h-5 text-[#00C6FF] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold truncate">{message.attachmentName}</p>
                          <p className="text-[9px] opacity-65">Нажмите для скачивания (симуляция)</p>
                        </div>
                      </div>
                    )}

                    {/* Message core text */}
                    {message.text && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.text}</p>
                    )}

                    {/* Metadata (Time and checkmarks inside balloon) */}
                    <div className="flex items-center gap-1.5 justify-end mt-1 opacity-60 text-[9px] font-bold">
                      <span>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && (
                        <span>
                          {message.status === 'read' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                          ) : message.status === 'delivered' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-slate-300" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Mock typing indicator block */}
        {contact.typing && (
          <div className="flex w-full justify-start">
            <div className={`px-4 py-3 rounded-2xl flex items-center gap-1.5 shadow-sm border ${
              isDarkMode ? 'bg-slate-900 border-white/5 text-slate-100 rounded-bl-sm' : 'bg-white border-slate-100 text-indigo-500 rounded-bl-sm'
            }`}>
              <span className="text-xs font-bold leading-none animate-pulse">Печатает</span>
              <div className="flex gap-1 items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6BFF] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6BFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6BFF] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message composition area footer */}
      <div className={`z-10 relative border-t ${
        isDarkMode ? 'bg-[#0B1120] border-white/8' : 'bg-white border-slate-200'
      }`}>
        
        {/* Simulated Attachment showcase drawer */}
        {pendingAttachment && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className={`px-6 py-2 border-b flex items-center justify-between gap-3 text-xs ${
              isDarkMode ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {pendingAttachment.type === 'image' ? (
                <Image className="w-4 h-4 text-[#2D6BFF] shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className={`font-semibold truncate max-w-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {pendingAttachment.name}
              </span>
              <span className="text-[10px] opacity-50 uppercase tracking-widest">({pendingAttachment.type})</span>
            </div>
            <button 
              onClick={clearAttachment}
              className="p-1 rounded-full bg-slate-200/50 dark:bg-white/5 hover:bg-rose-500/15 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Quick Emoji suggestions widget */}
        {showEmojiPicker && (
          <div className={`px-6 py-2 border-b flex flex-wrap gap-2 justify-center items-center ${
            isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-slate-50 border-slate-150'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 mr-2 select-none">Быстрые эмодзи:</span>
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="text-base p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-[10px] font-bold text-rose-500 ml-auto hover:underline cursor-pointer"
            >
              Свернуть
            </button>
          </div>
        )}

        {/* Input form */}
        <form onSubmit={handleSendSubmit} className="p-4 flex items-center gap-3">
          
          {/* Quick Mock attachment trigger drawer */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className={`p-3 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                isDarkMode ? 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 border border-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="Прикрепить файл"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
          </div>

          {/* Quick inline Emojis trigger */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-3 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isDarkMode ? 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 border border-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title="Выбрать эмодзи"
          >
            <Smile className="w-5 h-5 text-[#2D6BFF]" />
          </button>

          {/* Main composition input field */}
          <input
            type="text"
            placeholder="Напишите сообщение..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:ring-1 ${
              isDarkMode
                ? 'bg-slate-950 border-white/8 text-white focus:border-[#2D6BFF] focus:ring-[#2D6BFF]/40'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#2D6BFF] focus:ring-[#2D6BFF]/30 font-semibold'
            }`}
          />

          {/* Elegant mock image simulation tools specifically for testing */}
          <div className="hidden lg:flex items-center gap-1 text-[10px]">
            <button
              type="button"
              onClick={() => handleSimulatedImage('https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=400', 'flashchat_dashboard.jpeg')}
              className="px-2 py-1 text-xs select-none hover:underline text-[#2D6BFF]"
              title="Добавить тестовое фото"
            >
              +Фото
            </button>
          </div>

          {/* Send buttons */}
          <button
            type="submit"
            className="p-3 bg-gradient-to-tr from-[#1E50FF] to-[#01B6FF] text-white rounded-xl shadow-lg shadow-[#2D6BFF]/20 hover:opacity-95 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Отправить сообщение"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
}
