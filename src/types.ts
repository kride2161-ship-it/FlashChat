/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  code: string;
  avatarSeed: string; // Used to generate charming Dicebear-style avatars or dynamic initials
  avatarBg: string; // Hex color for avatar background
  status: string;
  isOnline: boolean;
}

export interface Contact {
  id: string; // unique ID
  username: string; // Handle
  name: string; // Display name
  code: string; // Code used to add them
  avatarSeed: string;
  avatarBg: string;
  isOnline: boolean;
  typing: boolean;
  lastSeen?: string;
  statusMessage?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderCode: string;
  recipientId: string;
  recipientCode: string;
  text: string;
  timestamp: string; // ISO String
  isRead: boolean;
  status: 'sent' | 'delivered' | 'read';
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
  attachmentName?: string;
}

export interface ChatSession {
  contactId: string;
  messages: Message[];
}
