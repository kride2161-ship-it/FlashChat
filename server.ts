import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const DB_FILE = path.join(process.cwd(), 'chat_database.json');

  app.use(express.json());

  // Structure of our database
  interface DbUser {
    id: string;
    username: string;
    name: string;
    code: string;
    avatarSeed: string;
    avatarBg: string;
    status: string;
    isOnline: boolean;
    lastActive: number; // timestamp
  }

  interface DbMessage {
    id: string;
    senderId: string;
    senderCode: string;
    recipientId: string;
    recipientCode: string;
    text: string;
    timestamp: string;
    isRead: boolean;
    status: 'sent' | 'delivered' | 'read';
    attachmentUrl?: string;
    attachmentType?: 'image' | 'file';
    attachmentName?: string;
  }

  interface DbSchema {
    users: DbUser[];
    messages: DbMessage[];
  }

  let db: DbSchema = {
    users: [],
    messages: []
  };

  // Initial load
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      console.error('Error loading DB file, resetting database.', e);
    }
  }

  function saveDb() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving DB file', e);
    }
  }

  // REST endpoints
  // 1. Register or get current user details
  app.post('/api/register', (req, res) => {
    const { username, name, code, avatarSeed, avatarBg, status } = req.body;
    
    if (!username || !name || !code) {
      return res.status(400).json({ error: 'Missing registration details' });
    }

    // Try finding user by contact code
    let existingUser = db.users.find(u => u.code === code);
    
    if (!existingUser) {
      existingUser = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }

    if (existingUser) {
      existingUser.isOnline = true;
      existingUser.lastActive = Date.now();
      saveDb();
      return res.json({ success: true, user: existingUser });
    }

    const newUser: DbUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      username,
      name,
      code,
      avatarSeed,
      avatarBg,
      status: status || 'Привет! Я пользуюсь FlashChat 🚄',
      isOnline: true,
      lastActive: Date.now()
    };

    db.users.push(newUser);
    saveDb();
    res.json({ success: true, user: newUser });
  });

  // Update Profile
  app.post('/api/profile/update', (req, res) => {
    const { code, name, status, avatarBg, isOnline } = req.body;
    const user = db.users.find(u => u.code === code);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (status !== undefined) user.status = status;
    if (avatarBg !== undefined) user.avatarBg = avatarBg;
    if (isOnline !== undefined) user.isOnline = isOnline;
    user.lastActive = Date.now();

    saveDb();
    res.json({ success: true, user });
  });

  // Search user by their 14-digit code
  app.get('/api/search', (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required' });
    }

    const found = db.users.find(u => u.code === code);
    if (!found) {
      return res.json({ success: true, user: null });
    }

    res.json({
      success: true,
      user: {
        id: found.id,
        username: found.username,
        name: found.name,
        code: found.code,
        avatarSeed: found.avatarSeed,
        avatarBg: found.avatarBg,
        status: found.status,
        isOnline: found.isOnline,
        lastActive: found.lastActive
      }
    });
  });

  // Send Message
  app.post('/api/messages/send', (req, res) => {
    const { senderCode, recipientCode, text, attachment } = req.body;
    if (!senderCode || !recipientCode) {
      return res.status(400).json({ error: 'Sender and recipient codes required' });
    }

    const sender = db.users.find(u => u.code === senderCode);
    const recipient = db.users.find(u => u.code === recipientCode);

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    const newMessage: DbMessage = {
      id: 'msg_' + Date.now().toString() + '_' + Math.random().toString().slice(2, 6),
      senderId: sender.id,
      senderCode: sender.code,
      recipientId: recipient ? recipient.id : 'custom_' + recipientCode,
      recipientCode: recipientCode,
      text: text || '',
      timestamp: new Date().toISOString(),
      isRead: false,
      status: 'sent',
      attachmentUrl: attachment?.url,
      attachmentType: attachment?.type,
      attachmentName: attachment?.name
    };

    db.messages.push(newMessage);
    
    sender.lastActive = Date.now();
    if (recipient) {
      recipient.lastActive = Date.now();
    }

    saveDb();
    res.json({ success: true, message: newMessage });
  });

  // Mark incoming messages as read
  app.post('/api/messages/read', (req, res) => {
    const { userCode, peerCode } = req.body;
    if (!userCode || !peerCode) {
      return res.status(400).json({ error: 'Missing codes' });
    }

    let modified = false;
    db.messages.forEach(m => {
      if (m.senderCode === peerCode && m.recipientCode === userCode && !m.isRead) {
        m.isRead = true;
        m.status = 'read';
        modified = true;
      }
    });

    if (modified) {
      saveDb();
    }
    res.json({ success: true });
  });

  // Sync endpoint (long-polling trigger target)
  app.get('/api/sync', (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'User code is required' });
    }

    const user = db.users.find(u => u.code === code);
    if (user) {
      user.isOnline = true;
      user.lastActive = Date.now();
    }

    // Filter messages involving this user
    const userMessages = db.messages.filter(m => m.senderCode === code || m.recipientCode === code);

    // Online/offline statuses and metadata of users
    const now = Date.now();
    const contactsStates = db.users.map(u => {
      let isOnline = u.isOnline;
      // If inactive for 25 seconds, mark as offline
      if (u.code !== code && isOnline && now - u.lastActive > 25000) {
        isOnline = false;
      }
      return {
        id: u.id,
        code: u.code,
        username: u.username,
        name: u.name,
        status: u.status,
        avatarSeed: u.avatarSeed,
        avatarBg: u.avatarBg,
        isOnline,
        lastSeen: now - u.lastActive < 15000 ? 'в сети' : 'был(а) недавно'
      };
    });

    res.json({
      success: true,
      messages: userMessages,
      contactsStates
    });
  });

  // Serve Vite app in development vs static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on address http://0.0.0.0:${PORT}`);
  });
}

startServer();
