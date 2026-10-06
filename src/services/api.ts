import {
  User,
  LostFoundItem,
  Claim,
  AppNotification,
  AdminStats,
  ItemMatch,
  FinderScoreProfile,
} from '../types';

export const api = {
  // Auth
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/users');
    const data = await res.json();
    return data.users || [];
  },

  async login(email: string): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  async register(payload: {
    name: string;
    email: string;
    role: string;
    studentOrStaffId: string;
    department: string;
    phoneNumber?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getCurrentUser(userId?: string): Promise<User> {
    const headers: Record<string, string> = {};
    if (userId) headers['x-user-id'] = userId;
    const res = await fetch('/api/auth/me', { headers });
    const data = await res.json();
    return data.user;
  },

  // Items
  async getItems(filters?: {
    type?: string;
    category?: string;
    location?: string;
    status?: string;
    search?: string;
    color?: string;
    userId?: string;
  }): Promise<LostFoundItem[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val && val !== 'all') params.append(key, val);
      });
    }
    const res = await fetch(`/api/items?${params.toString()}`);
    const data = await res.json();
    return data.items || [];
  },

  async getItemById(id: string): Promise<{ item: LostFoundItem; matches: ItemMatch[] }> {
    const res = await fetch(`/api/items/${id}`);
    if (!res.ok) {
      throw new Error('Item not found');
    }
    return res.json();
  },

  async reportItem(payload: Partial<LostFoundItem>): Promise<{ item: LostFoundItem; matches: ItemMatch[] }> {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit report');
    }
    return res.json();
  },

  async updateItemStatus(id: string, status: string, returnedToUserId?: string): Promise<LostFoundItem> {
    const res = await fetch(`/api/items/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, returnedToUserId }),
    });
    const data = await res.json();
    return data.item;
  },

  async deleteItem(id: string): Promise<boolean> {
    const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    return res.ok;
  },

  // AI Matching
  async compareItems(lostItemId: string, foundItemId: string): Promise<ItemMatch> {
    const res = await fetch('/api/match/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lostItemId, foundItemId }),
    });
    if (!res.ok) {
      throw new Error('Failed to run AI comparison');
    }
    return res.json();
  },

  async getAllMatches(): Promise<ItemMatch[]> {
    const res = await fetch('/api/matches');
    const data = await res.json();
    return data.matches || [];
  },

  // Claims
  async getClaims(filters?: { itemId?: string; claimantId?: string; status?: string }): Promise<Claim[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
    }
    const res = await fetch(`/api/claims?${params.toString()}`);
    const data = await res.json();
    return data.claims || [];
  },

  async submitClaim(payload: Partial<Claim>): Promise<Claim> {
    const res = await fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit claim');
    }
    const data = await res.json();
    return data.claim;
  },

  async reviewClaim(
    claimId: string,
    status: 'approved' | 'rejected',
    adminNotes: string,
    reviewerId: string
  ): Promise<{ claim: Claim; item: LostFoundItem | null }> {
    const res = await fetch(`/api/claims/${claimId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes, reviewerId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to review claim');
    }
    return res.json();
  },

  // Finder Score
  async getFinderProfile(userId: string): Promise<FinderScoreProfile> {
    const res = await fetch(`/api/users/${userId}/finder-profile`);
    const data = await res.json();
    return data.profile;
  },

  // Notifications
  async getNotifications(userId: string): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    const res = await fetch(`/api/notifications?userId=${userId}`);
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  },

  // Admin stats
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    return data.stats;
  },
};
