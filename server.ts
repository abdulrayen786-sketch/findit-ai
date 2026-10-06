import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './server/db';
import { compareItemsWithGemini } from './server/aiMatcher';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// ==========================================
// API ROUTES
// ==========================================

// --- AUTHENTICATION & USERS ---
app.get('/api/auth/users', (req: Request, res: Response) => {
  const users = db.getUsers();
  res.json({ users });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'No user registered with this email' });
  }

  res.json({ user, token: `session-${user.id}` });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, studentOrStaffId, department, phoneNumber } = req.body;
  if (!name || !email || !studentOrStaffId) {
    return res.status(400).json({ error: 'Name, email, and ID number are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'A user with this college email already exists' });
  }

  const newUser = db.createUser({
    name,
    email,
    role: role || 'student',
    studentOrStaffId,
    department: department || 'General Studies',
    phoneNumber,
    avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
  });

  res.status(201).json({ user: newUser, token: `session-${newUser.id}` });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.json({ user: null });
  }

  const user = db.getUserById(userId);
  res.json({ user: user || null });
});

// --- ITEMS (LOST & FOUND) ---
app.get('/api/items', (req: Request, res: Response) => {
  const { type, category, location, status, search, color, userId } = req.query;
  const items = db.getItems({
    type: type as string,
    category: category as string,
    location: location as string,
    status: status as string,
    search: search as string,
    color: color as string,
    userId: userId as string,
  });
  res.json({ items, count: items.length });
});

app.get('/api/items/:id', (req: Request, res: Response) => {
  const item = db.getItemById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const matches = db.getMatchesForItem(item.id);
  res.json({ item, matches });
});

app.post('/api/items', async (req: Request, res: Response) => {
  try {
    const {
      type,
      title,
      category,
      description,
      date,
      approximateTime,
      location,
      buildingOrArea,
      color,
      brand,
      distinguishingFeatures,
      imageUrl,
      contactPreference,
      userId,
      userName,
      userRole,
      userDepartment,
    } = req.body;

    if (!type || !title || !category || !description || !location || !date) {
      return res.status(400).json({ error: 'Missing mandatory fields for reporting' });
    }

    const { item, matches } = await db.createItem({
      type,
      title,
      category,
      description,
      date,
      approximateTime: approximateTime || '12:00',
      location,
      buildingOrArea: buildingOrArea || 'General Area',
      color: color || 'Unspecified',
      brand,
      distinguishingFeatures,
      imageUrl,
      contactPreference: contactPreference || 'portal_only',
      userId: userId || 'usr-guest',
      userName: userName || 'Student Reporter',
      userRole: userRole || 'student',
      userDepartment: userDepartment || 'Campus Member',
    });

    res.status(201).json({ item, matches });
  } catch (error: any) {
    console.error('Error reporting item:', error);
    res.status(500).json({ error: 'Failed to create item report', details: error.message });
  }
});

app.patch('/api/items/:id/status', (req: Request, res: Response) => {
  const { status, returnedToUserId } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updated = db.updateItemStatus(req.params.id, status, returnedToUserId);
  if (!updated) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (status === 'RETURNED') {
    // Reward finder score
    db.updateFinderScore(updated.userId, 25, true);

    // Notify users
    db.createNotification({
      userId: updated.userId,
      title: 'Item Restored! +25 Finder Score',
      message: `Your reported item "${updated.title}" has been marked as returned to its rightful owner.`,
      type: 'return',
      link: `/items/${updated.id}`,
    });
  }

  res.json({ item: updated });
});

app.delete('/api/items/:id', (req: Request, res: Response) => {
  const success = db.deleteItem(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json({ success: true, message: 'Item removed successfully' });
});

// --- AI MATCHING ON DEMAND ---
app.get('/api/items/:id/matches', (req: Request, res: Response) => {
  const matches = db.getMatchesForItem(req.params.id);
  res.json({ matches });
});

app.get('/api/matches', (req: Request, res: Response) => {
  const matches = db.getAllMatches();
  res.json({ matches });
});

app.post('/api/match/compare', async (req: Request, res: Response) => {
  try {
    const { lostItemId, foundItemId } = req.body;
    const lostItem = db.getItemById(lostItemId);
    const foundItem = db.getItemById(foundItemId);

    if (!lostItem || !foundItem) {
      return res.status(404).json({ error: 'One or both items could not be located' });
    }

    const aiResult = await compareItemsWithGemini(lostItem, foundItem);
    res.json({
      lostItemId,
      foundItemId,
      lostItemTitle: lostItem.title,
      foundItemTitle: foundItem.title,
      ...aiResult,
    });
  } catch (error: any) {
    console.error('AI comparison endpoint error:', error);
    res.status(500).json({ error: 'AI comparison failed', details: error.message });
  }
});

// --- CLAIMS & OWNERSHIP VERIFICATION ---
app.get('/api/claims', (req: Request, res: Response) => {
  const { itemId, claimantId, status } = req.query;
  const claims = db.getClaims({
    itemId: itemId as string,
    claimantId: claimantId as string,
    status: status as string,
  });
  res.json({ claims });
});

app.post('/api/claims', (req: Request, res: Response) => {
  const {
    itemId,
    claimantId,
    claimantName,
    claimantEmail,
    claimantStudentId,
    claimantDepartment,
    uniqueFeatureProof,
    approximatePurchaseInfo,
    itemContentsProof,
    privateDescription,
    additionalEvidence,
  } = req.body;

  const item = db.getItemById(itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (!uniqueFeatureProof || !privateDescription) {
    return res.status(400).json({ error: 'Mandatory verification answers required to file a claim' });
  }

  const claim = db.createClaim({
    itemId,
    itemTitle: item.title,
    itemType: item.type,
    claimantId: claimantId || 'usr-claimant',
    claimantName: claimantName || 'Campus Student',
    claimantEmail: claimantEmail || 'student@campus.edu',
    claimantStudentId: claimantStudentId || 'STUDENT-ID',
    claimantDepartment: claimantDepartment || 'University',
    uniqueFeatureProof,
    approximatePurchaseInfo,
    itemContentsProof,
    privateDescription,
    additionalEvidence,
  });

  res.status(201).json({ claim });
});

app.post('/api/claims/:id/review', (req: Request, res: Response) => {
  const { status, adminNotes, reviewerId } = req.body;
  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  const result = db.reviewClaim(req.params.id, status, adminNotes || '', reviewerId || 'admin-reviewer');
  if (!result) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  res.json(result);
});

// --- FINDER SCORE PROFILE ---
app.get('/api/users/:id/finder-profile', (req: Request, res: Response) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const badges = [];
  if (user.itemsReturnedCount >= 1) {
    badges.push({
      id: 'bdg-1',
      title: 'First Compassionate Return',
      iconName: 'Award',
      description: 'Restored a misplaced item back to its student owner.',
      earnedAt: new Date(user.createdAt).toISOString().split('T')[0],
    });
  }
  if (user.itemsReturnedCount >= 3 && user.finderScore >= 80) {
    badges.push({
      id: 'bdg-2',
      title: 'Campus Trusted Samaritan',
      iconName: 'ShieldCheck',
      description: 'Maintained a verified 80+ Finder Score with 3+ confirmed physical handovers.',
      earnedAt: new Date().toISOString().split('T')[0],
    });
  }
  if (user.finderScore >= 95) {
    badges.push({
      id: 'bdg-3',
      title: 'Campus Pillar of Integrity',
      iconName: 'Sparkles',
      description: 'Top-tier reputation achieved through exemplary campus citizenship.',
      earnedAt: new Date().toISOString().split('T')[0],
    });
  }

  const history = [
    {
      id: 'h-init',
      action: 'Account Registration',
      points: 50,
      reason: 'Official university profile created.',
      date: new Date(user.createdAt).toISOString().split('T')[0],
    },
  ];

  if (user.itemsReturnedCount > 0) {
    history.push({
      id: 'h-return',
      action: 'Item Return Confirmed',
      points: user.itemsReturnedCount * 25,
      reason: `${user.itemsReturnedCount} successful item return(s) verified by campus administration.`,
      date: new Date().toISOString().split('T')[0],
    });
  }

  if (user.verifiedHelpfulActionsCount > 0) {
    history.push({
      id: 'h-action',
      action: 'Helpful Campus Verification',
      points: user.verifiedHelpfulActionsCount * 10,
      reason: 'Assisted campus security in ownership identification.',
      date: new Date().toISOString().split('T')[0],
    });
  }

  res.json({
    profile: {
      userId: user.id,
      userName: user.name,
      finderScore: user.finderScore,
      itemsReturnedCount: user.itemsReturnedCount,
      verifiedHelpfulActionsCount: user.verifiedHelpfulActionsCount,
      badges,
      history,
    },
  });
});

// Dev seed endpoints (Isolated in dev per requirement 12)
app.post('/api/admin/dev-seed', (req: Request, res: Response) => {
  db.loadDevSeed();
  res.json({ success: true, message: 'Isolated demo seed loaded for evaluation.' });
});

app.post('/api/admin/clear-all', (req: Request, res: Response) => {
  db.clearAllData();
  res.json({ success: true, message: 'All reports and claims cleared.' });
});

// --- NOTIFICATIONS ---
app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
  if (!userId) {
    return res.json({ notifications: [], unreadCount: 0 });
  }
  const notifications = db.getNotifications(userId);
  res.json({ notifications, unreadCount: notifications.filter(n => !n.read).length });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const success = db.markNotificationAsRead(req.params.id);
  res.json({ success });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const userId = (req.body.userId as string) || 'usr-student-1';
  db.markAllNotificationsAsRead(userId);
  res.json({ success: true });
});

// --- ADMIN STATS ---
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC SERVER
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> FINDIT AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
