export type UserRole = 'student' | 'staff' | 'admin';

export type ItemStatus =
  | 'LOST'
  | 'FOUND'
  | 'POTENTIAL_MATCH'
  | 'CLAIMED'
  | 'VERIFICATION_PENDING'
  | 'RETURNED'
  | 'CLOSED';

export type ItemType = 'lost' | 'found';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentOrStaffId: string;
  department: string;
  avatarUrl?: string;
  phoneNumber?: string;
  finderScore: number;
  itemsReturnedCount: number;
  verifiedHelpfulActionsCount: number;
  createdAt: string;
}

export interface LostFoundItem {
  id: string; // e.g. "FND-2026-8921" or "LST-2026-1042"
  type: ItemType;
  title: string;
  category: string;
  description: string;
  date: string;
  approximateTime: string;
  location: string;
  buildingOrArea: string;
  color: string;
  brand?: string;
  distinguishingFeatures?: string;
  imageUrl?: string;
  contactPreference: 'portal_only' | 'email' | 'phone';
  status: ItemStatus;
  userId: string;
  userName: string;
  userRole: UserRole;
  userDepartment?: string;
  matchedItemId?: string;
  matchScore?: number;
  resolvedAt?: string;
  returnedToUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchReasoning {
  categoryMatch: boolean;
  colorMatch: boolean;
  locationProximityScore: number; // 0 - 100
  timeProximityScore: number; // 0 - 100
  semanticSimilarityScore: number; // 0 - 100
  featureMatchScore: number; // 0 - 100
  reasons: string[];
  recommendation: string;
}

export interface ItemMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  lostItemTitle: string;
  foundItemTitle: string;
  score: number; // 0 - 100
  confidenceLabel: 'Strong Match' | 'Possible Match' | 'Weak Match' | 'Low Match';
  reasoning: MatchReasoning;
  createdAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  itemTitle: string;
  itemType: ItemType;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantStudentId: string;
  claimantDepartment: string;
  uniqueFeatureProof: string;
  approximatePurchaseInfo?: string;
  itemContentsProof?: string;
  privateDescription: string;
  additionalEvidence?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface FinderBadge {
  id: string;
  title: string;
  iconName: string;
  description: string;
  earnedAt: string;
}

export interface FinderScoreProfile {
  userId: string;
  userName: string;
  finderScore: number;
  itemsReturnedCount: number;
  verifiedHelpfulActionsCount: number;
  badges: FinderBadge[];
  history: {
    id: string;
    action: string;
    points: number;
    reason: string;
    date: string;
  }[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'claim' | 'return' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AdminStats {
  totalReports: number;
  lostItemsCount: number;
  foundItemsCount: number;
  returnedItemsCount: number;
  pendingClaimsCount: number;
  activeUsersCount: number;
  strongMatchesCount: number;
  averageReturnDays: number;
  recoveryRatePercent: number;
}
