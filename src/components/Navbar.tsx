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
      <header className="sticky top-0 z-40 bg-[#0d0f12]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-[#1E88E5] to-[#1565C0] p-0.5 shadow-[0_0_15px_rgba(30,136,229,0.3)] flex items-center justify-center shrink-0">
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
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Convoy
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400 border border-white/[0.08] hidden sm:inline-block">
                  SRMIST
                </span>
              </div>
            </div>

            {/* Desktop Center Navigation Pills */}
            <nav className="hidden md:flex items-center gap-1 bg-[#16181d] border border-white/[0.08] p-1 rounded-full shadow-inner">
              <button
                onClick={() => setActiveTab('exam')}
                className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isRidesActive
                    ? 'bg-[#1E88E5] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Rides</span>
              </button>
              <button
                onClick={() => setActiveTab('my-rides')}
                className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 relative cursor-pointer ${
                  activeTab === 'my-rides'
                    ? 'bg-[#242730] text-white border border-white/[0.1] shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Activity</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                )}
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={onOpenCreateModal}
                className="btn-primary text-xs py-2 px-4 gap-1.5 shrink-0 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Post Ride</span>
              </button>

              {user ? (
                <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-white/[0.08]">
                  <button
                    onClick={onEditProfile}
                    title="Edit Profile"
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-white/[0.05] text-left transition-colors group cursor-pointer"
                  >
                    {/* Unfugly avatar circle style */}
                    <div className="w-8 h-8 rounded-full border-2 border-[#1E88E5] bg-[#1E88E5]/20 flex items-center justify-center text-white font-bold text-xs shadow-sm transition-transform group-hover:scale-105 shrink-0">
                      {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left pr-1">
                      <span className="text-xs font-bold text-white truncate max-w-[110px] group-hover:text-[#60a5fa] transition-colors leading-tight">
                        {user.full_name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono truncate max-w-[110px] leading-tight">
                        {user.user_net_id || 'Student'}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={onSignOut}
                    title="Sign Out"
                    className="p-2 rounded-full text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn-secondary text-xs py-2 px-4 gap-1.5 flex items-center shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#1E88E5]" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f12]/95 backdrop-blur-2xl border-t border-white/[0.08] px-4 py-2">
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <button
            onClick={() => setActiveTab('exam')}
            className={`flex flex-col items-center py-1 px-5 rounded-2xl transition-all ${
              isRidesActive ? 'text-[#1E88E5] font-bold' : 'text-gray-400'
            }`}
          >
            <GraduationCap className={`w-5 h-5 mb-0.5 ${isRidesActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[11px]">Rides</span>
          </button>

          <button
            onClick={() => setActiveTab('my-rides')}
            className={`flex flex-col items-center py-1 px-5 rounded-2xl transition-all relative ${
              activeTab === 'my-rides' ? 'text-white font-bold' : 'text-gray-400'
            }`}
          >
            <Users className={`w-5 h-5 mb-0.5 ${activeTab === 'my-rides' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[11px]">Activity</span>
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
