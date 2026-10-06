import React, { useState } from 'react';
import {
  Search,
  Bell,
  PlusCircle,
  Shield,
  Award,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppNotification } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenReport: (type: 'lost' | 'found') => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenReport,
  onOpenAuth,
}) => {
  const {
    currentUser,
    availableUsers,
    switchUser,
    notifications,
    unreadNotifsCount,
    markNotificationRead,
    markAllNotificationsRead,
    logout,
  } = useAuth();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleNotifClick = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.link) {
      if (n.link.startsWith('/items/')) {
        const itemId = n.link.replace('/items/', '');
        onNavigate('item-details', itemId);
      } else if (n.link === '/admin') {
        onNavigate('admin');
      } else if (n.link === '/finder-score') {
        onNavigate('finder-score');
      }
    }
    setShowNotifs(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Campus Demo Banner & Persona Switcher */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white tracking-wide">
            COLLEGE IPE DEMO
          </span>
          <span className="hidden sm:inline text-slate-400">
            Marwadi University Campus Portal • CSE (AI/ML)
          </span>
        </div>

        {/* Active User Switcher when accounts exist */}
        {availableUsers.length > 0 ? (
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[11px] hidden md:inline">
              Active User:
            </span>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => switchUser(e.target.value)}
              className="bg-slate-800 text-slate-100 text-xs rounded border border-slate-700 px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenAuth}
              className="text-blue-300 hover:text-white text-[11px] underline font-medium"
            >
              Sign In / Register Account
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-900 text-white shadow-md group-hover:bg-blue-800 transition-colors">
              <Compass className="w-5 h-5 text-blue-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-blue-950 font-sans">
                  FINDIT
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-1 tracking-tight">
                Lost it? FINDIT.
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('browse')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'browse'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Browse Items
            </button>
            <button
              onClick={() => onNavigate('finder-score')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                currentView === 'finder-score'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Finder Score</span>
            </button>

            {currentUser && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                My Dashboard
              </button>
            )}

            {/* Admin link if user is admin */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
                  currentView === 'admin'
                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Admin Center</span>
              </button>
            )}
          </nav>

          {/* Quick Actions (Report Lost / Found) & User Badges */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={() => onOpenReport('lost')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-xs"
            >
              + Report Lost
            </button>
            <button
              onClick={() => onOpenReport('found')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
            >
              + Report Found
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-900">
                        Campus Notifications
                      </span>
                      {unreadNotifsCount > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications yet. You will get alerts when AI matches your items!
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-xs text-slate-900 flex items-center space-x-1">
                              {n.type === 'match' && (
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 inline mr-1 shrink-0" />
                              )}
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                              {new Date(n.createdAt).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 leading-snug line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill / Menu */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all text-left"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">
                      {currentUser.name}
                    </p>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                      <span className="text-amber-600 font-bold">
                        ★ {currentUser.finderScore}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{currentUser.role}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <span className="text-slate-600 font-medium">Finder Score</span>
                        <span className="font-bold text-blue-900">{currentUser.finderScore}/100</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Personal Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('finder-score');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Finder Score & Badges
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        Admin Control Center
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        onOpenAuth();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      Switch / Register Account
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-900 text-white hover:bg-blue-800 transition-colors shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 text-slate-600"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-rose-600 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => {
                onOpenReport('lost');
                setShowMobileMenu(false);
              }}
              className="w-full py-2 text-center rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
            >
              + Report Lost Item
            </button>
            <button
              onClick={() => {
                onOpenReport('found');
                setShowMobileMenu(false);
              }}
              className="w-full py-2 text-center rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              + Report Found Item
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('browse');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Browse Campus Items
            </button>
            <button
              onClick={() => {
                onNavigate('finder-score');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Finder Score & Integrity</span>
              <Award className="w-4 h-4 text-amber-500" />
            </button>
            <button
              onClick={() => {
                onNavigate('dashboard');
                setShowMobileMenu(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Student Dashboard
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-purple-800 bg-purple-50"
              >
                Admin Control Center
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
