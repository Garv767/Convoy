import React from 'react';
import Link from 'next/link';
import { GraduationCap, Users, Plus, LogIn, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'all' | 'exam' | 'my-rides';
  setActiveTab: (tab: 'all' | 'exam' | 'my-rides') => void;
  onOpenCreateModal: () => void;
  onEditProfile?: () => void;
  user: UserProfile | null;
  onSignOut: () => void;
  pendingCount?: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onEditProfile,
  user,
  onSignOut,
  pendingCount = 0,
}: NavbarProps) {
  const isRidesActive = activeTab === 'all' || activeTab === 'exam';

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0f1117]/85 backdrop-blur-md border-b border-border/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-accent to-accent2 p-0.5 shadow-md shadow-accent/20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                  <path
                    d="M48 20.5C45.5 15.5 40 12 33 12C21.4 12 12 21.4 12 33C12 44.6 21.4 54 33 54C42 54 49 48 51.5 40"
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <path d="M25 25L41 33L25 41L29 33L25 25Z" fill="#FFFFFF" />
                  <circle cx="48" cy="20.5" r="3.5" fill="#38BDF8" />
                </svg>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Convoy
                </span>
              </div>
            </div>

            {/* Desktop Center Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-surface2 p-1 rounded-xl border border-border">
              <button
                onClick={() => setActiveTab('exam')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isRidesActive
                    ? 'bg-accent2 text-white shadow-sm'
                    : 'text-muted hover:text-text hover:bg-surface/60'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Rides</span>
              </button>
              <button
                onClick={() => setActiveTab('my-rides')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                  activeTab === 'my-rides'
                    ? 'bg-surface border border-accent/40 text-accent shadow-sm'
                    : 'text-muted hover:text-text hover:bg-surface/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Activity</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                )}
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onOpenCreateModal}
                className="btn-primary bg-accent2 hover:bg-accent2/80 text-xs py-2 px-3 sm:px-4 gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Ride</span>
              </button>

              {user ? (
                <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-border">
                  <button
                    onClick={onEditProfile}
                    title="Edit Profile"
                    className="flex items-center gap-2 p-1 sm:p-1.5 rounded-lg hover:bg-surface2 text-left transition-colors group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-surface2 border border-border group-hover:border-accent/60 flex items-center justify-center text-accent font-bold text-xs transition-colors shrink-0">
                      {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-semibold text-text truncate max-w-[120px] group-hover:text-accent transition-colors">
                        {user.full_name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-muted font-mono truncate max-w-[120px]">
                        Edit Profile
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={onSignOut}
                    title="Sign Out"
                    className="p-2 rounded-lg text-muted hover:text-red hover:bg-surface2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn-secondary text-xs py-1.5 px-3 gap-1.5 flex items-center"
                >
                  <LogIn className="w-3.5 h-3.5 text-accent" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0f1117]/95 backdrop-blur-lg border-t border-border px-4 py-2">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab('exam')}
            className={`flex flex-col items-center py-1 px-4 rounded-xl transition-colors ${
              isRidesActive ? 'text-accent2 font-semibold' : 'text-muted'
            }`}
          >
            <GraduationCap className={`w-5 h-5 mb-0.5 ${isRidesActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[11px]">Rides</span>
          </button>

          <button
            onClick={() => setActiveTab('my-rides')}
            className={`flex flex-col items-center py-1 px-4 rounded-xl transition-colors relative ${
              activeTab === 'my-rides' ? 'text-accent font-semibold' : 'text-muted'
            }`}
          >
            <Users className={`w-5 h-5 mb-0.5 ${activeTab === 'my-rides' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[11px]">Activity</span>
            {pendingCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-accent" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
