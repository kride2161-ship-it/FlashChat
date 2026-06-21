/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Contact, UserProfile } from '../types';
import { Search, Plus, User, Moon, Sun, Flame, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import Logo from './Logo';

interface SidebarProps {
  contacts: Contact[];
  activeContactId: string | null;
  onSelectContact: (id: string) => void;
  currentUser: UserProfile;
  onOpenProfile: () => void;
  onOpenAddContact: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  lastMessagesMap: Record<string, { text: string; timestamp: Date; senderId: string }>;
}

export default function Sidebar({
  contacts,
  activeContactId,
  onSelectContact,
  currentUser,
  onOpenProfile,
  onOpenAddContact,
  isDarkMode,
  onToggleTheme,
  lastMessagesMap
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-full md:w-80 lg:w-96 flex flex-col h-full border-r shrink-0 transition-colors duration-300 ${isDarkMode ? 'bg-[#0B1120] border-white/8' : 'bg-white border-slate-200'}`}>
      
      {/* Sidebar Header */}
      <div className="p-4 flex flex-col gap-3.5 border-b border-transparent">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          
          <div className="flex items-center gap-1">
            {/* Direct Theme Trigger */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                isDarkMode 
                  ? 'border-white/8 bg-white/5 hover:bg-white/10 text-amber-400' 
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'
              }`}
              title="Переключить тему"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile Button */}
            <button
              onClick={onOpenProfile}
              className={`p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 ${
                isDarkMode 
                  ? 'border-white/8 bg-white/5 hover:bg-white/10 text-white' 
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
              title="Настройки профиля"
            >
              <div 
                style={{ backgroundColor: currentUser.avatarBg }} 
                className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center text-white"
              >
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold hidden sm:inline truncate max-w-[65px]">
                {currentUser.name.split(' ')[0]}
              </span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Поиск контактов или ников..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-sm font-medium transition-all focus:outline-none focus:ring-1 ${
              isDarkMode
                ? 'bg-slate-900 border-white/8 text-white placeholder-slate-500 focus:border-[#2D6BFF] focus:ring-[#2D6BFF]/50'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#2D6BFF] focus:ring-[#2D6BFF]/40'
            }`}
          />
        </div>
      </div>

      {/* Tabs list (like Active chats counter) */}
      <div className="px-4 py-1.5 flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Все диалоги ({filteredContacts.length})
        </span>

        {/* Floating Add contact trigger */}
        <button
          onClick={onOpenAddContact}
          className="flex items-center gap-1 text-xs font-bold text-[#2D6BFF] hover:underline cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Добавить
        </button>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1.5 py-2">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-10 px-4">
            <span className="block text-3xl mb-2">🔍</span>
            <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Контакты не найдены
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Нажмите "+", чтобы добавить контакт по коду
            </p>
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const isActive = activeContactId === contact.id;
            const lastMsg = lastMessagesMap[contact.id];
            
            return (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact.id)}
                className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center gap-3 relative cursor-pointer select-none group ${
                  isActive
                    ? 'bg-[#2D6BFF] text-white shadow-lg shadow-[#2D6BFF]/15'
                    : isDarkMode
                      ? 'hover:bg-white/4 text-slate-200'
                      : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                {/* Contact Avatar with Status */}
                <div className="relative shrink-0">
                  <div
                    style={{ backgroundColor: contact.avatarBg }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg select-none relative shadow-sm"
                  >
                    {contact.name.slice(0, 2).toUpperCase()}
                  </div>
                  {contact.isOnline && (
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${isActive ? 'border-[#2D6BFF]' : isDarkMode ? 'border-[#0B1120]' : 'border-white'} bg-emerald-500`} />
                  )}
                </div>

                {/* Info block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-sm truncate">{contact.name}</span>
                    <span className={`text-[10px] select-none font-medium whitespace-nowrap opacity-60`}>
                      {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    {contact.typing ? (
                      <span className={`text-xs font-bold italic animate-pulse ${isActive ? 'text-white/80' : 'text-[#2D6BFF]'}`}>
                        печатает...
                      </span>
                    ) : (
                      <p className={`text-xs truncate ${isActive ? 'text-white/70' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {lastMsg ? (lastMsg.senderId === 'current_user' ? 'Вы: ' : '') + lastMsg.text : contact.statusMessage || ''}
                      </p>
                    )}

                    {contact.unreadCount > 0 && (
                      <span className={`h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center text-[10px] font-extrabold select-none ${
                        isActive ? 'bg-white text-[#2D6BFF]' : 'bg-[#2D6BFF] text-white'
                      }`}>
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* User Micro profile foot section */}
      <div className={`p-4 border-t flex items-center justify-between gap-3 ${isDarkMode ? 'border-white/5 bg-slate-950/20' : 'border-slate-100 bg-slate-50/10'}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            style={{ backgroundColor: currentUser.avatarBg }} 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shrink-0 relative shadow-inner"
          >
            {currentUser.name.slice(0, 2).toUpperCase()}
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border bg-emerald-500 ${isDarkMode ? 'border-[#0B1120]' : 'border-white'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold leading-none truncate mb-1">{currentUser.name}</p>
            <p className={`text-[10px] font-semibold truncate leading-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>@{currentUser.username}</p>
          </div>
        </div>
        <button
          onClick={onOpenProfile}
          className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-wide uppercase transition-all hover:scale-102 active:scale-98 cursor-pointer ${
            isDarkMode 
              ? 'border-white/8 hover:bg-white/5 text-slate-300' 
              : 'border-slate-200 hover:bg-slate-100 text-slate-600'
          }`}
        >
          Кабинет
        </button>
      </div>

    </div>
  );
}
