import React from 'react';
import { GraduationCap, Search, Clock, MapPin, Sparkles } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent2/20 via-surface to-accent/15 border border-accent2/30 p-6 mb-8">
      {/* Background glow orb */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent2/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent2/20 text-accent2 border border-accent2/30">
              <GraduationCap className="w-4 h-4" />
              <span>Dedicated Exam Hub</span>
            </div>
            <h1 className="text-2xl font-bold text-text tracking-tight">
              SRMIST Exam Rush Transit
            </h1>
            <p className="text-xs sm:text-sm text-muted max-w-xl">
              Don't stress over morning autos or traffic near Potheri. Pool rides with peers writing the same session and heading to the same block.
            </p>
          </div>

          <button
            onClick={onPostExamRide}
            className="btn-primary bg-accent2 hover:bg-accent2/80 text-xs sm:text-sm py-2.5 px-5 self-start md:self-auto shadow-md shadow-accent2/20"
          >
            + Post Exam Ride
          </button>
        </div>

        {/* Filter bar: Session + Venue (Flexible Text Search) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-border/60">
          {/* Session Selector */}
          <div className="sm:col-span-5 flex items-center gap-1 bg-surface2/80 p-1 rounded-xl border border-border">
            <button
              onClick={() => setSelectedSession('all')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                selectedSession === 'all'
                  ? 'bg-accent2 text-white shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              All Sessions
            </button>
            <button
              onClick={() => setSelectedSession('FN')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                selectedSession === 'FN'
                  ? 'bg-accent2 text-white shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              FN (9:00 AM)
            </button>
            <button
              onClick={() => setSelectedSession('AN')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                selectedSession === 'AN'
                  ? 'bg-accent2 text-white shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              AN (1:30 PM)
            </button>
          </div>

          {/* Venue Text Search */}
          <div className="sm:col-span-7 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={venueSearch}
              onChange={(e) => setVenueSearch(e.target.value)}
              placeholder="Search by venue (e.g. 'Tech Park', 'UB', 'Bio-Tech', '8th Floor')..."
              className="input-field w-full pl-9 text-xs"
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
    </div>
  );
}
