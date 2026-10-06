import { User, LostFoundItem, Claim, AppNotification, AdminStats, ItemMatch } from '../src/types';
import { INITIAL_USERS, INITIAL_ITEMS, INITIAL_CLAIMS, INITIAL_NOTIFICATIONS } from './seedData';
import { compareItemsWithGemini } from './aiMatcher';

class Database {
  private users: User[] = [];
  private items: LostFoundItem[] = [];
  private claims: Claim[] = [];
  private notifications: AppNotification[] = [];
  private matchesCache: Map<string, ItemMatch> = new Map();

  constructor() {
    // Starts with a clean empty database for production.
  }

  loadDevSeed(): void {
    this.users = [...INITIAL_USERS];
    this.items = [...INITIAL_ITEMS];
    this.claims = [...INITIAL_CLAIMS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.computeInitialMatches();
  }

  clearAllData(): void {
    this.items = [];
    this.claims = [];
    this.notifications = [];
    this.matchesCache.clear();
  }

  private async computeInitialMatches() {
    // Generate matches between existing lost and found items
    const lostItems = this.items.filter(i => i.type === 'lost');
    const foundItems = this.items.filter(i => i.type === 'found');

    for (const lost of lostItems) {
      for (const found of foundItems) {
        if (lost.category === found.category) {
          const matchKey = `${lost.id}_${found.id}`;
          const res = await compareItemsWithGemini(lost, found);
          if (res.score >= 50) {
            this.matchesCache.set(matchKey, {
              id: `MCH-${lost.id}-${found.id}`,
              lostItemId: lost.id,
              foundItemId: found.id,
              lostItemTitle: lost.title,
              foundItemTitle: found.title,
              score: res.score,
              confidenceLabel: res.confidenceLabel,
              reasoning: res.reasoning,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    }
  }

  // Users
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Omit<User, 'id' | 'finderScore' | 'itemsReturnedCount' | 'verifiedHelpfulActionsCount' | 'createdAt'>): User {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now().toString(36)}`,
      finderScore: 50, // Base starting reputation
      itemsReturnedCount: 0,
      verifiedHelpfulActionsCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  updateFinderScore(userId: string, deltaPoints: number, isReturn: boolean = false): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    user.finderScore = Math.max(0, Math.min(100, user.finderScore + deltaPoints));
    if (isReturn) {
      user.itemsReturnedCount += 1;
      user.verifiedHelpfulActionsCount += 1;
    } else if (deltaPoints > 0) {
      user.verifiedHelpfulActionsCount += 1;
    }
    return user;
  }

  // Items
  getItems(filters?: {
    type?: string;
    category?: string;
    location?: string;
    status?: string;
    search?: string;
    color?: string;
    userId?: string;
  }): LostFoundItem[] {
    let result = [...this.items];

    if (!filters) return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (filters.type && filters.type !== 'all') {
      result = result.filter(i => i.type === filters.type);
    }
    if (filters.category && filters.category !== 'all') {
      result = result.filter(i => i.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.location && filters.location !== 'all') {
      result = result.filter(i => i.location.toLowerCase().includes(filters.location!.toLowerCase()));
    }
    if (filters.status && filters.status !== 'all') {
      result = result.filter(i => i.status.toUpperCase() === filters.status!.toUpperCase());
    }
    if (filters.color && filters.color !== 'all') {
      result = result.filter(i => i.color.toLowerCase().includes(filters.color!.toLowerCase()));
    }
    if (filters.userId) {
      result = result.filter(i => i.userId === filters.userId);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.buildingOrArea.toLowerCase().includes(q) ||
        (i.brand && i.brand.toLowerCase().includes(q)) ||
        (i.distinguishingFeatures && i.distinguishingFeatures.toLowerCase().includes(q)) ||
        i.id.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getItemById(id: string): LostFoundItem | undefined {
    return this.items.find(i => i.id === id);
  }

  async createItem(itemData: Omit<LostFoundItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<{
    item: LostFoundItem;
    matches: ItemMatch[];
  }> {
    const id = `${itemData.type === 'lost' ? 'LST' : 'FND'}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newItem: LostFoundItem = {
      ...itemData,
      id,
      status: itemData.type === 'lost' ? 'LOST' : 'FOUND',
      createdAt: now,
      updatedAt: now,
    };

    this.items.unshift(newItem);

    // Run AI matching against opposite item type
    const matches: ItemMatch[] = [];
    const candidates = this.items.filter(i =>
      i.id !== newItem.id &&
      i.type !== newItem.type &&
      i.status !== 'RETURNED' &&
      i.status !== 'CLOSED'
    );

    for (const candidate of candidates) {
      const lostItem = newItem.type === 'lost' ? newItem : candidate;
      const foundItem = newItem.type === 'found' ? newItem : candidate;

      const aiResult = await compareItemsWithGemini(lostItem, foundItem);

      if (aiResult.score >= 50) {
        const matchObj: ItemMatch = {
          id: `MCH-${lostItem.id}-${foundItem.id}`,
          lostItemId: lostItem.id,
          foundItemId: foundItem.id,
          lostItemTitle: lostItem.title,
          foundItemTitle: foundItem.title,
          score: aiResult.score,
          confidenceLabel: aiResult.confidenceLabel,
          reasoning: aiResult.reasoning,
          createdAt: now,
        };

        matches.push(matchObj);
        this.matchesCache.set(`${lostItem.id}_${foundItem.id}`, matchObj);

        // Update item statuses to POTENTIAL_MATCH if score >= 70
        if (aiResult.score >= 70) {
          if (newItem.status === 'LOST' || newItem.status === 'FOUND') {
            newItem.status = 'POTENTIAL_MATCH';
          }
          if (candidate.status === 'LOST' || candidate.status === 'FOUND') {
            candidate.status = 'POTENTIAL_MATCH';
          }

          // Create notification for users
          this.createNotification({
            userId: candidate.userId,
            title: `Potential AI Match Detected (${aiResult.score}%)`,
            message: `New report "${newItem.title}" was identified as a potential match for your ${candidate.title}.`,
            type: 'match',
            link: `/items/${newItem.id}`,
          });

          this.createNotification({
            userId: newItem.userId,
            title: `Potential AI Match Detected (${aiResult.score}%)`,
            message: `Found an existing report "${candidate.title}" with high correlation (${aiResult.score}%).`,
            type: 'match',
            link: `/items/${candidate.id}`,
          });
        }
      }
    }

    return { item: newItem, matches };
  }

  updateItemStatus(id: string, status: LostFoundItem['status'], returnedToUserId?: string): LostFoundItem | null {
    const item = this.getItemById(id);
    if (!item) return null;

    item.status = status;
    item.updatedAt = new Date().toISOString();

    if (status === 'RETURNED') {
      item.resolvedAt = new Date().toISOString();
      if (returnedToUserId) {
        item.returnedToUserId = returnedToUserId;
      }
    }

    return item;
  }

  deleteItem(id: string): boolean {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }

  // Matches
  getMatchesForItem(itemId: string): ItemMatch[] {
    const item = this.getItemById(itemId);
    if (!item) return [];

    const matches: ItemMatch[] = [];
    for (const match of this.matchesCache.values()) {
      if (match.lostItemId === itemId || match.foundItemId === itemId) {
        matches.push(match);
      }
    }
    return matches.sort((a, b) => b.score - a.score);
  }

  getAllMatches(): ItemMatch[] {
    return Array.from(this.matchesCache.values()).sort((a, b) => b.score - a.score);
  }

  // Claims
  getClaims(filters?: { itemId?: string; claimantId?: string; status?: string }): Claim[] {
    let result = [...this.claims];
    if (filters?.itemId) {
      result = result.filter(c => c.itemId === filters.itemId);
    }
    if (filters?.claimantId) {
      result = result.filter(c => c.claimantId === filters.claimantId);
    }
    if (filters?.status) {
      result = result.filter(c => c.status === filters.status);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getClaimById(id: string): Claim | undefined {
    return this.claims.find(c => c.id === id);
  }

  createClaim(claimData: Omit<Claim, 'id' | 'status' | 'createdAt'>): Claim {
    const newClaim: Claim = {
      ...claimData,
      id: `CLM-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.claims.unshift(newClaim);

    // Update item status to CLAIMED
    this.updateItemStatus(claimData.itemId, 'CLAIMED');

    // Notify admins
    const admins = this.users.filter(u => u.role === 'admin');
    for (const admin of admins) {
      this.createNotification({
        userId: admin.id,
        title: 'New Ownership Claim Submitted',
        message: `${claimData.claimantName} filed an ownership claim on ${claimData.itemTitle}.`,
        type: 'claim',
        link: '/admin',
      });
    }

    return newClaim;
  }

  reviewClaim(
    claimId: string,
    status: 'approved' | 'rejected',
    adminNotes: string,
    reviewerId: string
  ): { claim: Claim; item: LostFoundItem | null } | null {
    const claim = this.getClaimById(claimId);
    if (!claim) return null;

    claim.status = status;
    claim.adminNotes = adminNotes;
    claim.reviewedBy = reviewerId;
    claim.reviewedAt = new Date().toISOString();

    const item = this.getItemById(claim.itemId) || null;

    if (status === 'approved' && item) {
      // Mark item as VERIFICATION_PENDING or RETURNED
      item.status = 'VERIFICATION_PENDING';
      item.updatedAt = new Date().toISOString();

      // Award finder score points to the finder!
      this.updateFinderScore(item.userId, 20, false);

      this.createNotification({
        userId: claim.claimantId,
        title: 'Claim Verified & Approved!',
        message: `Your ownership claim for "${claim.itemTitle}" was approved by campus authority. Collect your item with your student ID.`,
        type: 'claim',
        link: `/items/${claim.itemId}`,
      });
    } else if (status === 'rejected' && item) {
      item.status = item.type === 'found' ? 'FOUND' : 'LOST';
      item.updatedAt = new Date().toISOString();

      this.createNotification({
        userId: claim.claimantId,
        title: 'Claim Update: Verification Inconclusive',
        message: `Your claim for "${claim.itemTitle}" could not be confirmed: ${adminNotes}`,
        type: 'claim',
        link: `/items/${claim.itemId}`,
      });
    }

    return { claim, item };
  }

  // Notifications
  getNotifications(userId: string): AppNotification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(data: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): AppNotification {
    const notif: AppNotification = {
      ...data,
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(notif);
    return notif;
  }

  markNotificationAsRead(id: string): boolean {
    const notif = this.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.read = true;
    return true;
  }

  markAllNotificationsAsRead(userId: string): void {
    this.notifications
      .filter(n => n.userId === userId)
      .forEach(n => { n.read = true; });
  }

  // Admin Statistics
  getAdminStats(): AdminStats {
    const totalReports = this.items.length;
    const lostItemsCount = this.items.filter(i => i.type === 'lost').length;
    const foundItemsCount = this.items.filter(i => i.type === 'found').length;
    const returnedItemsCount = this.items.filter(i => i.status === 'RETURNED').length;
    const pendingClaimsCount = this.claims.filter(c => c.status === 'pending').length;
    const activeUsersCount = this.users.length;
    const strongMatchesCount = Array.from(this.matchesCache.values()).filter(m => m.score >= 80).length;

    const recoveryRate = totalReports > 0 ? Math.round((returnedItemsCount / Math.max(lostItemsCount, 1)) * 100) : 0;

    return {
      totalReports,
      lostItemsCount,
      foundItemsCount,
      returnedItemsCount,
      pendingClaimsCount,
      activeUsersCount,
      strongMatchesCount,
      averageReturnDays: returnedItemsCount > 0 ? 1.5 : 0,
      recoveryRatePercent: Math.min(100, recoveryRate),
    };
  }
}

export const db = new Database();
