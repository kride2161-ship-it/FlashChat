/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, Contact, Message } from './types';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import AddContactModal from './components/AddContactModal';
import UserProfileModal from './components/UserProfileModal';
import ToastContainer, { ToastItem } from './components/Toast';
import { Plus, Moon, Sun, Shield, LogOut, CheckCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Generates a 14-digit numeric string
const generate14DigitCode = (): string => {
  let code = '';
  for (let i = 0; i < 14; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
};

export default function App() {
  // Auth states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('flashchat_user');
    return cached ? JSON.parse(cached) : null;
  });

  // Contacts lists (persists)
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const cached = localStorage.getItem('flashchat_contacts');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return []; }
    }
    return [];
  });

  // Messages list (persists)
  const [messages, setMessages] = useState<Message[]>(() => {
    const cached = localStorage.getItem('flashchat_messages');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return []; }
    }
    return [];
  });

  // Selected chat context
  const [activeContactId, setActiveContactId] = useState<string | null>(() => {
    const cached = localStorage.getItem('flashchat_active_contact');
    return cached || null;
  });

  // Modals / Overlays
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Theme support
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const cached = localStorage.getItem('flashchat_theme');
    return cached === 'dark' || (!cached && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Notification Toast Stack
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Sound triggers (optional mock notification sounds via synthesized AudioContext!)
  const playNotificationSound = (type: 'send' | 'receive' | 'contact') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'send') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'receive') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'contact') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Ignore audio blocks
    }
  };

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('flashchat_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('flashchat_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('flashchat_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('flashchat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (activeContactId) {
      localStorage.setItem('flashchat_active_contact', activeContactId);
      // Automatically read all unread messages from this contact
      setContacts(prev => prev.map(c => 
        c.id === activeContactId ? { ...c, unreadCount: 0 } : c
      ));
    } else {
      localStorage.removeItem('flashchat_active_contact');
    }
  }, [activeContactId]);

  useEffect(() => {
    localStorage.setItem('flashchat_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Loop for real-time synchronization
  useEffect(() => {
    if (!currentUser) return;

    const syncWithServer = async () => {
      try {
        const response = await fetch(`/api/sync?code=${currentUser.code}`);
        if (!response.ok) return;
        const resData = await response.json();
        if (resData.success) {
          const serverMessages: Message[] = resData.messages;
          
          setMessages(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(serverMessages)) {
              const prevIds = new Set(prev.map(m => m.id));
              // Detect new messages from OTHER users
              const newIncoming = serverMessages.filter(
                m => m.senderCode !== currentUser.code && !prevIds.has(m.id)
              );
              
              if (newIncoming.length > 0) {
                playNotificationSound('receive');
                newIncoming.forEach(msg => {
                  const senderUser = resData.contactsStates.find((u: any) => u.code === msg.senderCode);
                  if (senderUser && activeContactId !== senderUser.id) {
                    addToast(`Новое сообщение от ${senderUser.name}! ✉️`, 'info');
                  }
                });
              }
              return serverMessages;
            }
            return prev;
          });

          // Sync online properties, avatarBg and name of current contacts
          setContacts(prev => {
            const updated = prev.map(contact => {
              const match = resData.contactsStates.find((u: any) => u.code === contact.code);
              if (match) {
                // If they have new unread messages in this sync, calculate increments if we are not matching activeContactId
                const wasActive = activeContactId === match.id;
                let unreadCount = contact.unreadCount;
                if (!wasActive) {
                  // Find unread count based on serverMessages
                  const senderMsgs = serverMessages.filter(
                    m => m.senderCode === match.code && m.recipientCode === currentUser.code && !m.isRead
                  );
                  unreadCount = senderMsgs.length;
                } else {
                  unreadCount = 0;
                }

                return {
                  ...contact,
                  name: match.name,
                  username: match.username,
                  isOnline: match.isOnline,
                  statusMessage: match.status,
                  avatarBg: match.avatarBg,
                  avatarSeed: match.avatarSeed,
                  lastSeen: match.lastSeen,
                  unreadCount
                };
              }
              return contact;
            });

            // If someone wrote to us, instantly add them to sidebar contacts lists
            const existingCodes = new Set(updated.map(c => c.code));
            const newContactsToAdd: Contact[] = [];
            
            serverMessages.forEach(msg => {
              const peerCode = msg.senderCode === currentUser.code ? msg.recipientCode : msg.senderCode;
              if (peerCode !== currentUser.code && !existingCodes.has(peerCode)) {
                const peerInfo = resData.contactsStates.find((u: any) => u.code === peerCode);
                if (peerInfo) {
                  newContactsToAdd.push({
                    id: peerInfo.id,
                    username: peerInfo.username,
                    name: peerInfo.name,
                    code: peerInfo.code,
                    avatarSeed: peerInfo.avatarSeed,
                    avatarBg: peerInfo.avatarBg,
                    isOnline: peerInfo.isOnline,
                    typing: false,
                    statusMessage: peerInfo.status,
                    unreadCount: 1
                  });
                  existingCodes.add(peerCode);
                }
              }
            });

            if (newContactsToAdd.length > 0) {
              return [...newContactsToAdd, ...updated];
            }

            if (JSON.stringify(prev) !== JSON.stringify(updated)) {
              return updated;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Error in sync polling loop:', err);
      }
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 2000);
    return () => clearInterval(interval);
  }, [currentUser, activeContactId]);

  // Automatically mark open active chat messages as read on backend
  useEffect(() => {
    if (!currentUser || !activeContactId) return;
    const activeContact = contacts.find(c => c.id === activeContactId);
    if (!activeContact) return;

    const markAsRead = async () => {
      try {
        await fetch('/api/messages/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userCode: currentUser.code,
            peerCode: activeContact.code
          })
        });
      } catch (err) {
        // fail silently
      }
    };

    markAsRead();
  }, [activeContactId, currentUser, contacts, messages.length]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' | 'copy') => {
    const newToast: ToastItem = {
      id: Math.random().toString(),
      message,
      type
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep last 5 toasts max
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Switch Theme Toggle
  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
    addToast(isDarkMode ? 'Светлая тема включена ☀️' : 'Линейно-темный режим активирован 🌙', 'info');
  };

  // User Registration Event
  const handleRegisterSuccess = async (username: string, name: string, seed: string, avatarBg: string) => {
    const userCode = generate14DigitCode();
    const payload = {
      username,
      name,
      code: userCode,
      avatarSeed: seed,
      avatarBg,
      status: 'Привет! Я пользуюсь современным FlashChat 🚄'
    };

    try {
      const resp = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        addToast('Ошибка регистрации на сервере.', 'error');
        return;
      }
      const data = await resp.json();
      if (data.success) {
        setCurrentUser(data.user);
        addToast(`Добро пожаловать, ${name}! Учетная запись успешно создана. 🌟`, 'success');
        playNotificationSound('contact');
      }
    } catch (err) {
      addToast('Не удалось связаться с сервером при регистрации.', 'error');
    }
  };

  // Add Contact By 14 digits code
  const handleAddContact = async (code: string): Promise<boolean> => {
    const duplicate = contacts.find(c => c.code === code);
    if (duplicate) {
      addToast(`Контакт "${duplicate.name}" уже находится в списке! 😊`, 'warning');
      return false;
    }

    try {
      const resp = await fetch(`/api/search?code=${code}`);
      if (!resp.ok) {
        addToast('Ошибка сервера при поиске контакта.', 'error');
        return false;
      }
      
      const data = await resp.json();
      if (data.success && data.user) {
        const found = data.user;
        const newContact: Contact = {
          id: found.id,
          username: found.username,
          name: found.name,
          code: found.code,
          avatarSeed: found.avatarSeed,
          avatarBg: found.avatarBg,
          isOnline: found.isOnline,
          typing: false,
          statusMessage: found.status,
          unreadCount: 0
        };

        setContacts(prev => [newContact, ...prev]);
        addToast(`Новый контакт добавлен: ${found.name} 🎉`, 'success');
        playNotificationSound('contact');
        setActiveContactId(found.id);
        return true;
      } else {
        addToast('Пользователь с таким кодом не найден. Проверьте правильность входа!', 'warning');
        return false;
      }
    } catch (err) {
      addToast('Не удалось связаться с сервером при поиске.', 'error');
      return false;
    }
  };

  // Send message
  const handleSendMessage = async (text: string, attachment?: { type: 'image' | 'file'; url: string; name: string }) => {
    if (!activeContactId || !currentUser) return;

    const activeContact = contacts.find(c => c.id === activeContactId);
    if (!activeContact) return;

    const payload = {
      senderCode: currentUser.code,
      recipientCode: activeContact.code,
      text,
      attachment
    };

    try {
      const resp = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setMessages(prev => [...prev, data.message]);
          playNotificationSound('send');
        }
      }
    } catch (err) {
      addToast('Не удалось отправить сообщение.', 'error');
    }
  };

  // Clear dialog history
  const handleClearHistory = (contactId: string) => {
    setMessages(prev => prev.filter(m => 
      !((m.senderId === 'current_user' && m.recipientId === contactId) || 
        (m.senderId === contactId && m.recipientId === 'current_user'))
    ));
    addToast('История сообщений очищена!', 'success');
  };

  // Edit user profile
  const handleUpdateProfile = async (name: string, status: string, avatarBg: string, isOnline: boolean) => {
    if (!currentUser) return;
    
    const payload = {
      code: currentUser.code,
      name,
      status,
      avatarBg,
      isOnline
    };

    try {
      const resp = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setCurrentUser(data.user);
          addToast('Профиль успешно обновлен! ✨', 'success');
        }
      } else {
        addToast('Ошибка сервера при обновлении профиля.', 'error');
      }
    } catch (err) {
      addToast('Проблема сети при обновлении профиля.', 'error');
    }
  };

  // Sign out / Logout action
  const handleLogout = () => {
    if (window.confirm('Вы действительно хотите выйти из своего профиля FlashChat?')) {
      setCurrentUser(null);
      setActiveContactId(null);
      addToast('Вы успешно вышли из системы.', 'info');
    }
  };

  const activeContact = contacts.find(c => c.id === activeContactId) || null;
  const activeChatMessages = messages.filter(m => 
    activeContactId && (
      (m.senderId === 'current_user' && m.recipientId === activeContactId) ||
      (m.senderId === activeContactId && m.recipientId === 'current_user')
    )
  );

  // Group last messages map to display previews in the list
  const lastMessagesMap: Record<string, { text: string; timestamp: Date; senderId: string }> = {};
  messages.forEach(m => {
    const peerId = m.senderId === 'current_user' ? m.recipientId : m.senderId;
    const currentStored = lastMessagesMap[peerId];
    const mTime = new Date(m.timestamp);
    if (!currentStored || mTime > currentStored.timestamp) {
      lastMessagesMap[peerId] = {
        text: m.attachmentType ? `📎 [Отправлен ${m.attachmentType === 'image' ? 'рисунок' : 'файл'}]` : m.text,
        timestamp: mTime,
        senderId: m.senderId
      };
    }
  });

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-500 overflow-hidden ${
      isDarkMode 
        ? 'dark app-bg-gradient-dark text-[#F1F5F9]' 
        : 'app-bg-gradient-light text-[#1E293B]'
    }`}>
      
      {/* Toast popup layer */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <AnimatePresence mode="wait">
        {!currentUser ? (
          <AuthScreen 
            onRegisterSuccess={handleRegisterSuccess} 
            isDarkMode={isDarkMode} 
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full h-screen flex items-center justify-center p-0 md:p-6"
          >
            {/* Main messenger glass frame container */}
            <div className={`w-full h-full max-w-7xl md:h-[90vh] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row backdrop-blur-3xl relative z-10 transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-[#0F172A]/80 border border-white/5 shadow-black/60' 
                : 'bg-white/80 border border-white/40 shadow-slate-300/40'
            }`}>
              
              {/* Sidebar Left Component */}
              <Sidebar
                contacts={contacts}
                activeContactId={activeContactId}
                onSelectContact={setActiveContactId}
                currentUser={currentUser}
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenAddContact={() => setIsAddContactOpen(true)}
                isDarkMode={isDarkMode}
                onToggleTheme={handleToggleTheme}
                lastMessagesMap={lastMessagesMap}
              />

              {/* Chat Window Central Component */}
              <ChatWindow
                contact={activeContact}
                messages={activeChatMessages}
                currentUser={currentUser}
                isDarkMode={isDarkMode}
                onSendMessage={handleSendMessage}
                onClearHistory={handleClearHistory}
                onTriggerToast={addToast}
              />

              {/* Float Round Plus Button Trigger in absolute layout (bottom right) */}
              <button
                onClick={() => setIsAddContactOpen(true)}
                style={{ zIndex: 30 }}
                className="fixed bottom-6 right-6 md:absolute md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-[#1E50FF] to-[#01F6FF] text-white flex items-center justify-center shadow-xl shadow-[#2D6BFF]/30 hover:scale-110 active:scale-95 duration-200 transition-transform cursor-pointer group"
                title="Добавить контакт"
              >
                <Plus className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Add Contact modal with your contact code logic inside */}
      <AnimatePresence>
        {isAddContactOpen && currentUser && (
          <AddContactModal
            isOpen={isAddContactOpen}
            onClose={() => setIsAddContactOpen(false)}
            userCode={currentUser.code}
            onAddContact={handleAddContact}
            onTriggerToast={addToast}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      {/* Floating Customize profile settings & theme options */}
      <AnimatePresence>
        {isProfileOpen && currentUser && (
          <UserProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            profileName={currentUser.name}
            profileUsername={currentUser.username}
            profileStatus={currentUser.status}
            avatarBg={currentUser.avatarBg}
            isOnline={currentUser.isOnline}
            isDarkMode={isDarkMode}
            onUpdateProfile={handleUpdateProfile}
            onToggleTheme={handleToggleTheme}
            isGuest={currentUser.username === 'super_user'}
            onLogout={handleLogout}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
