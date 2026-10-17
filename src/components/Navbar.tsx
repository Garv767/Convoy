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
                  <span className="w-2 h-2 rounded-full bg-[#FBC02D] animate-pulse shadow-[0_0_8px_rgba(251,192,45,0.8)]" />
                )}
              </button>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* WhatsApp Community & Extension Quick Links */}
              <div className="flex items-center gap-1">
                <a
                  href="https://chat.whatsapp.com/GlmnZ3g0Zb8IXFTa3tOImT"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp Community"
                  className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-[#25D366] hover:bg-white/[0.05] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.019 14.12 1.01 11.52 1.01c-5.448 0-9.873 4.37-9.878 9.802-.002 1.743.46 3.447 1.34 4.954l-.99 3.614 3.655-.958zm12.335-5.464c-.302-.15-1.786-.882-2.07-.987-.282-.104-.489-.156-.694.15-.205.307-.795.987-.975 1.191-.18.205-.359.23-.66.08-1.597-.799-2.617-1.436-3.666-3.235-.278-.475.278-.44.795-1.474.086-.174.043-.326-.021-.475-.065-.15-.544-1.309-.745-1.792-.195-.47-.393-.406-.54-.413-.14-.007-.301-.008-.461-.008-.161 0-.422.06-.643.302-.221.241-.844.824-.844 2.01 0 1.185.864 2.33 1.025 2.502.161.171 1.7 2.593 4.12 3.633.576.248 1.025.395 1.376.507.579.183 1.106.157 1.522.095.464-.069 1.487-.607 1.695-1.191.208-.585.208-1.087.146-1.191-.063-.105-.23-.156-.53-.307z"/>
                  </svg>
                </a>
                <a
                  href="https://extension.unfugly.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chrome Extension"
                  className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-[#1E88E5] hover:bg-white/[0.05] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                    <path d="M464 128h-80V80c0-44.18-35.82-80-80-80s-80 35.82-80 80v48h-80c-26.51 0-48 21.49-48 48v80H48c-26.51 0-48 21.49-48 48s21.49 48 48 48h48v80c0 26.51 21.49 48 48 48h80v48c0 44.18 35.82 80 80 80s80-35.82 80-80v-48h80c26.51 0 48-21.49 48-48v-80h48c26.51 0 48-21.49 48-48s-21.49-48-48-48h-48v-80c0-26.51-21.49-48-48-48z"/>
                  </svg>
                </a>
              </div>

              <button
                onClick={onOpenCreateModal}
                className="btn-primary text-xs py-2 px-3.5 sm:px-4 gap-1.5 shrink-0 shadow-md"
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
              <span className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-[#FBC02D] shadow-[0_0_8px_rgba(251,192,45,0.8)]" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
