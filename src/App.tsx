import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './pages/HomeView';
import { BrowseView } from './pages/BrowseView';
import { ReportItemView } from './pages/ReportItemView';
import { ItemDetailsView } from './pages/ItemDetailsView';
import { DashboardView } from './pages/DashboardView';
import { AdminDashboardView } from './pages/AdminDashboardView';
import { FinderScoreView } from './pages/FinderScoreView';
import { ClaimModal } from './components/ClaimModal';
import { AIExplanationModal } from './components/AIExplanationModal';
import { AuthModal } from './components/AuthModal';
import { LostFoundItem, ItemMatch, ItemType } from './types';
import { api } from './services/api';

function MainApp() {
  const { currentUser, refreshNotifications, refreshUserData } = useAuth();

  // Navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [browseInitialQuery, setBrowseInitialQuery] = useState<string>('');

  // Items State
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [itemForClaim, setItemForClaim] = useState<LostFoundItem | null>(null);
  const [matchForModal, setMatchForModal] = useState<{
    lost: LostFoundItem;
    found: LostFoundItem;
    match: ItemMatch;
  } | null>(null);

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      const data = await api.getItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'browse') {
      setBrowseInitialQuery(param || '');
    }
    if (view === 'item-details' && param) {
      setSelectedItemId(param);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReport = (type: ItemType) => {
    setCurrentView(type === 'lost' ? 'report-lost' : 'report-found');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (id: string) => {
    setSelectedItemId(id);
    setCurrentView('item-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClaim = (item: LostFoundItem) => {
    setItemForClaim(item);
  };

  const handleInspectMatch = async (
    lost: LostFoundItem,
    found: LostFoundItem,
    match?: ItemMatch
  ) => {
    if (match) {
      setMatchForModal({ lost, found, match });
    } else {
      try {
        const computed = await api.compareItems(lost.id, found.id);
        setMatchForModal({ lost, found, match: computed });
      } catch (err) {
        console.error('Failed to compute real-time match:', err);
      }
    }
  };

  const handleItemReported = async (newItem: LostFoundItem, newMatches: ItemMatch[]) => {
    await fetchItems();
    await refreshNotifications();
  };

  const handleClaimSubmitted = async () => {
    await fetchItems();
    await refreshNotifications();
    await refreshUserData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenReport={handleOpenReport}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            items={items}
            onNavigate={handleNavigate}
            onOpenReport={handleOpenReport}
            onViewDetails={handleViewDetails}
            onClaim={handleClaim}
            onInspectMatch={(lost, found) => handleInspectMatch(lost, found)}
          />
        )}

        {currentView === 'browse' && (
          <BrowseView
            items={items}
            initialSearch={browseInitialQuery}
            onViewDetails={handleViewDetails}
            onClaim={handleClaim}
            onOpenReport={handleOpenReport}
          />
        )}

        {(currentView === 'report-lost' || currentView === 'report-found') && (
          <ReportItemView
            initialType={currentView === 'report-lost' ? 'lost' : 'found'}
            onItemReported={handleItemReported}
            onCancel={() => handleNavigate('browse')}
            onViewMatches={(item) => handleViewDetails(item.id)}
          />
        )}

        {currentView === 'item-details' && selectedItemId && (
          <ItemDetailsView
            itemId={selectedItemId}
            onBack={() => handleNavigate('browse')}
            onClaim={handleClaim}
            onInspectMatch={handleInspectMatch}
            onViewDetails={handleViewDetails}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={handleNavigate}
            onOpenReport={handleOpenReport}
            onViewDetails={handleViewDetails}
            onClaim={handleClaim}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            onViewDetails={handleViewDetails}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'finder-score' && <FinderScoreView />}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenReport={handleOpenReport} />

      {/* Claim Modal */}
      {itemForClaim && (
        <ClaimModal
          isOpen={!!itemForClaim}
          onClose={() => setItemForClaim(null)}
          item={itemForClaim}
          onClaimSubmitted={handleClaimSubmitted}
        />
      )}

      {/* AI Explanation Modal */}
      {matchForModal && (
        <AIExplanationModal
          isOpen={!!matchForModal}
          onClose={() => setMatchForModal(null)}
          lostItem={matchForModal.lost}
          foundItem={matchForModal.found}
          match={matchForModal.match}
          onInitiateClaim={handleClaim}
        />
      )}

      {/* Auth / Switcher Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
