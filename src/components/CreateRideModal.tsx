import React, { useState } from 'react';
import {
  X,
  Bus,
  TrainFront,
  CarTaxiFront,
  Bike,
  GraduationCap,
  Users,
} from 'lucide-react';
import { TransportMode, ExamSession, RideListing, UserProfile } from '../types';

interface CreateRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onCreateRide: (newRide: Omit<RideListing, 'id' | 'created_at' | 'status'>) => void;
}

const COMMON_PICKUPS = [
  'Estancia',
  'Abode Valley',
  'Arch Gate',
  'SRM Gate 1',
  'Potheri Stn',
  'Green Pearl',
];

export default function CreateRideModal({
  isOpen,
  onClose,
  currentUser,
  onCreateRide,
}: CreateRideModalProps) {
  // Shift & Timing (FN is 9am-12pm, AN is 2pm-5pm)
  const [examShift, setExamShift] = useState<ExamSession>('FN');
  const [departureDate, setDepartureDate] = useState('');
  React.useEffect(() => {
    setDepartureDate(new Date().toISOString().split('T')[0]);
  }, []);
  const [departureTime, setDepartureTime] = useState('07:15');

  // Route
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  // Mode
  const [transportMode, setTransportMode] = useState<TransportMode>('cab');

  // Seats (Filled & Available)
  const [availableSeats, setAvailableSeats] = useState(2);
  const [filledSeats, setFilledSeats] = useState(1);

  // Notes
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleShiftChange = (shift: ExamSession) => {
    setExamShift(shift);
    if (shift === 'FN') {
      setDepartureTime('07:15');
    } else {
      setDepartureTime('12:15');
    }
  };

  const getModeLabel = (mode: TransportMode) => {
    switch (mode) {
      case 'cab':
        return 'Auto / Cab';
      case 'bus':
        return 'Bus';
      case 'train':
        return 'Train / EMU';
      case 'private_vehicle':
        return 'Two-Wheeler';
      default:
        return 'Transit';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !destination.trim()) return;

    const total = Number(filledSeats) + Number(availableSeats);

    onCreateRide({
      host_id: currentUser?.id || '',
      ride_category: 'exam',
      exam_session: examShift,
      exam_venue: destination.trim(),
      origin: pickup.trim(),
      destination: destination.trim(),
      departure_date: departureDate,
      departure_time: departureTime,
      transport_mode: transportMode,
      vehicle_type: getModeLabel(transportMode),
      total_seats: total,
      available_seats: Number(availableSeats),
      fare_type: 'split',
      gender_preference: 'any',
      notes: notes.trim() || undefined,
      host_gender: currentUser?.gender || 'other',
      host_department: currentUser?.department || 'SRMIST',
      host_year: currentUser?.year_of_study || 1,
      host_is_verified: currentUser?.is_verified || false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-surface border-t sm:border border-border rounded-t-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent2/20 border border-accent2/30 text-accent2 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text">Post a Ride</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* 1. Exam Shift (FN / AN) */}
          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Exam Shift
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleShiftChange('FN')}
                className={`py-2 px-3 rounded-xl border text-left transition-all ${
                  examShift === 'FN'
                    ? 'border-accent2 bg-accent2/20 text-white shadow-sm'
                    : 'border-border bg-surface2 text-muted hover:text-text'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-text">FN Shift</span>
                  <span className="text-[10px] text-accent2 font-semibold">9 AM - 12 PM</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleShiftChange('AN')}
                className={`py-2 px-3 rounded-xl border text-left transition-all ${
                  examShift === 'AN'
                    ? 'border-accent2 bg-accent2/20 text-white shadow-sm'
                    : 'border-border bg-surface2 text-muted hover:text-text'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-text">AN Shift</span>
                  <span className="text-[10px] text-accent2 font-semibold">2 PM - 5 PM</span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Date & Departure Time */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Exam Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                required
                className="input-field w-full text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Departure Time
              </label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
                className="input-field w-full text-xs py-2"
              />
            </div>
          </div>

          {/* 3. Pickup Location with Quick Pickups & Destination */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Pickup Spot
              </label>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="e.g. Estancia Gate, SRM Arch Gate, Potheri Stn"
                required
                className="input-field w-full text-xs"
              />

              {/* Quick Pickups */}
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1.5">
                <span className="text-muted shrink-0 text-[11px]">Quick:</span>
                {COMMON_PICKUPS.map((spot) => (
                  <button
                    key={spot}
                    type="button"
                    onClick={() => setPickup(spot)}
                    className={`px-2 py-0.5 rounded text-[11px] border transition-colors shrink-0 ${
                      pickup === spot
                        ? 'bg-accent/20 border-accent/40 text-accent font-semibold'
                        : 'bg-surface2 text-muted hover:text-text border-border'
                    }`}
                  >
                    {spot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Chengalpattu, Ambattur, Sholinganallur..."
                required
                className="input-field w-full text-xs"
              />
            </div>
          </div>

          {/* 4. Mode of Transport */}
          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Mode of Transport
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTransportMode('cab')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs gap-1 transition-all ${
                  transportMode === 'cab'
                    ? 'border-yellow/50 bg-yellow/20 text-yellow font-bold'
                    : 'border-border bg-surface2 text-muted hover:text-text'
                }`}
              >
                <CarTaxiFront className="w-4 h-4" />
                <span className="text-[11px]">Auto / Cab</span>
              </button>

              <button
                type="button"
                onClick={() => setTransportMode('bus')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs gap-1 transition-all ${
                  transportMode === 'bus'
                    ? 'border-accent/50 bg-accent/20 text-accent font-bold'
                    : 'border-border bg-surface2 text-muted hover:text-text'
                }`}
              >
                <Bus className="w-4 h-4" />
                <span className="text-[11px]">Bus</span>
              </button>

              <button
                type="button"
                onClick={() => setTransportMode('train')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs gap-1 transition-all ${
                  transportMode === 'train'
                    ? 'border-accent2/50 bg-accent2/20 text-accent2 font-bold'
                    : 'border-border bg-surface2 text-muted hover:text-text'
                }`}
              >
                <TrainFront className="w-4 h-4" />
                <span className="text-[11px]">Train</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransportMode('private_vehicle');
                  setAvailableSeats(1);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs gap-1 transition-all ${
                  transportMode === 'private_vehicle'
                    ? 'border-green/50 bg-green/20 text-green font-bold'
                    : 'border-border bg-surface2 text-muted hover:text-text'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span className="text-[11px]">Two-Wheeler</span>
              </button>
            </div>
          </div>

          {/* 5. Seats (Filled and Available) */}
          <div className="p-3 rounded-xl bg-surface2/60 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent" />
                Seats Breakdown
              </span>
              <span className="text-[11px] text-muted">
                Total: <strong className="text-text">{Number(filledSeats) + Number(availableSeats)} seats</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-muted mb-1">
                  Available for others
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAvailableSeats(Math.max(1, availableSeats - 1))}
                    className="w-8 h-8 rounded-lg bg-surface border border-border text-text font-bold text-sm flex items-center justify-center hover:bg-surface2"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-text">
                    {availableSeats}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAvailableSeats(Math.min(6, availableSeats + 1))}
                    className="w-8 h-8 rounded-lg bg-surface border border-border text-text font-bold text-sm flex items-center justify-center hover:bg-surface2"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-muted mb-1">
                  Already filled (with you)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFilledSeats(Math.max(1, filledSeats - 1))}
                    className="w-8 h-8 rounded-lg bg-surface border border-border text-text font-bold text-sm flex items-center justify-center hover:bg-surface2"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-text">
                    {filledSeats}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilledSeats(Math.min(5, filledSeats + 1))}
                    className="w-8 h-8 rounded-lg bg-surface border border-border text-text font-bold text-sm flex items-center justify-center hover:bg-surface2"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Notes */}
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Leaving on time, splitting auto equally, carrying hall tickets..."
              className="input-field w-full text-xs resize-none"
            />
          </div>

          {/* Sticky Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border sticky bottom-0 bg-surface pb-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2.5 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2.5 px-5"
            >
              Publish Ride
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
