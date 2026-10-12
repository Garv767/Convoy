import React from 'react';
import { ShieldCheck, Plus, Car, GraduationCap, Users, Compass } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'all' | 'exam' | 'my-rides';
  setActiveTab: (tab: 'all' | 'exam' | 'my-rides') => void;
  onOpenCreateModal: () => void;
  user: UserProfile | null;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  user,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-accent2 flex items-center justify-center shadow-md shadow-accent/20">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent2 tracking-tight">
                  Convoy
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface2 border border-border text-muted">
                  unfugly
                </span>
              </div>
              <p className="text-[11px] text-muted hidden sm:block">
                SRMIST Verified Campus & Exam Transit
              </p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="flex items-center gap-1 bg-surface2/60 p-1 rounded-xl border border-border/80">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted hover:text-text hover:bg-surface/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>All Rides</span>
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'exam'
                  ? 'bg-accent2 text-white shadow-sm'
                  : 'text-muted hover:text-text hover:bg-surface/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Exam Transit</span>
            </button>
            <button
              onClick={() => setActiveTab('my-rides')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'my-rides'
                  ? 'bg-surface border border-accent/40 text-accent shadow-sm'
                  : 'text-muted hover:text-text hover:bg-surface/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">My Activity</span>
              <span className="sm:hidden">Activity</span>
            </button>
          </nav>

          {/* Right Action & User Chip */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCreateModal}
              className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Post Ride</span>
            </button>

            {user && (
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border text-xs">
                <div className="flex flex-col text-right">
                  <span className="font-medium text-text">{user.full_name}</span>
                  <span className="text-muted font-mono">{user.user_net_id}@srmist.edu.in</span>
                </div>
                <div
                  className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent"
                  title="Verified SRM Student"
                >
                  <ShieldCheck className="w-4 h-4 text-green" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
