import React from 'react';
import { GraduationCap, Search, Plus } from 'lucide-react';
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
    <div className="card mb-5 border-accent2/30 bg-surface p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent2/15 border border-accent2/30 text-accent2 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-text">NPTEL Exam Transit</h1>
            <p className="text-xs text-muted">Pool autos, cabs & transit to your NPTEL center</p>
          </div>
        </div>

        <button
          onClick={onPostExamRide}
          className="btn-primary bg-accent2 hover:bg-accent2/80 text-xs py-2 px-3.5 gap-1.5 self-start sm:self-auto shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post Ride</span>
        </button>
      </div>

      {/* Filter Row: Shift Selector + Center Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-3 border-t border-border">
        {/* Shift Selector */}
        <div className="sm:col-span-5 flex items-center gap-1 bg-surface2 p-1 rounded-xl border border-border">
          <button
            onClick={() => setSelectedSession('all')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              selectedSession === 'all'
                ? 'bg-accent2 text-white shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            All Shifts
          </button>
          <button
            onClick={() => setSelectedSession('FN')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              selectedSession === 'FN'
                ? 'bg-accent2 text-white shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            FN (9 AM)
          </button>
          <button
            onClick={() => setSelectedSession('AN')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              selectedSession === 'AN'
                ? 'bg-accent2 text-white shadow-sm'
                : 'text-muted hover:text-text'
            }`}
          >
            AN (2 PM)
          </button>
        </div>

        {/* Center Search */}
        <div className="sm:col-span-7 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={venueSearch}
            onChange={(e) => setVenueSearch(e.target.value)}
            placeholder="Search exam center (e.g. Chengalpattu, Ambattur)..."
            className="input-field w-full pl-9 text-xs py-2"
          />
          {venueSearch && (
            <button
              onClick={() => setVenueSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-muted hover:text-text"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
