import React from 'react';
import { GraduationCap, Search, Plus, Sparkles } from 'lucide-react';
import { ExamSession } from '../types';

interface ExamTransitBannerProps {
  selectedSession: 'all' | ExamSession;
  setSelectedSession: (session: 'all' | ExamSession) => void;
  venueSearch: string;
  setVenueSearch: (v: string) => void;
  onPostExamRide: () => void;
}

export default function ExamTransitBanner({
  selectedSession,
  setSelectedSession,
  venueSearch,
  setVenueSearch,
  onPostExamRide,
}: ExamTransitBannerProps) {
  return (
    <div className="relative mb-6 rounded-2xl sm:rounded-3xl bg-[#16181d] border border-white/[0.08] shadow-xl overflow-hidden">
      {/* Top Unfugly Blue Accent Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-[#1E88E5]" />

      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#1E88E5]/10 border border-[#1E88E5]/25 text-[#1E88E5] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-[#1E88E5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  NPTEL & Exam Transit
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#1E88E5]/15 text-[#60a5fa] border border-[#1E88E5]/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  SRM Verified
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Pool autos, cabs, and EMU trains to off-campus centers with SRM students
              </p>
            </div>
          </div>

          <button
            onClick={onPostExamRide}
            className="btn-primary self-start sm:self-auto text-xs py-2 px-4 gap-1.5 shrink-0 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Post Ride</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-white/[0.06]">
          {/* Shift Segmented Toggle */}
          <div className="sm:col-span-5 flex items-center gap-1 bg-[#101216] p-1 rounded-xl border border-white/[0.08]">
            <button
              onClick={() => setSelectedSession('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSession === 'all'
                  ? 'bg-[#1E88E5] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              All Shifts
            </button>
            <button
              onClick={() => setSelectedSession('FN')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSession === 'FN'
                  ? 'bg-[#1E88E5] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              FN (9 AM)
            </button>
            <button
              onClick={() => setSelectedSession('AN')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSession === 'AN'
                  ? 'bg-[#1E88E5] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              AN (2 PM)
            </button>
          </div>

          {/* Center Search Input */}
          <div className="sm:col-span-7 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={venueSearch}
              onChange={(e) => setVenueSearch(e.target.value)}
              placeholder="Search center (e.g. SRM Tech Park, Chengalpattu, Ambattur)..."
              className="w-full bg-[#101216] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl pl-9 pr-14 text-xs py-2.5 text-white placeholder-gray-500 transition-all outline-none"
            />
            {venueSearch && (
              <button
                onClick={() => setVenueSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-white font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
