import React, { useState } from 'react';
import {
  X,
  Bus,
  TrainFront,
  CarTaxiFront,
  Bike,
  GraduationCap,
  Users,
  MapPin,
  Clock,
  Calendar,
  Check,
} from 'lucide-react';
import { TransportMode, ExamSession, RideListing, UserProfile } from '../types';

interface CreateRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  initialRide?: RideListing | null;
  onCreateRide: (newRide: Omit<RideListing, 'id' | 'created_at' | 'status'>) => void;
  onUpdateRide?: (rideId: string, updatedRide: Partial<RideListing>) => void;
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
  initialRide,
  onCreateRide,
  onUpdateRide,
}: CreateRideModalProps) {
  const isEditing = Boolean(initialRide);

  // Shift & Timing (FN is 9am-12pm, AN is 2pm-5pm)
  const [examShift, setExamShift] = useState<ExamSession>('FN');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('07:15');

  // Route
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  // Mode
  const [transportMode, setTransportMode] = useState<TransportMode>('cab');

  // Seats (Filled & Available) - occupied ALWAYS includes the host (min 1)
  const [availableSeats, setAvailableSeats] = useState(2);
  const [filledSeats, setFilledSeats] = useState(1);

  // Notes
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (initialRide) {
      setExamShift(initialRide.exam_session || 'FN');
      setDepartureDate(initialRide.departure_date || '');
      setDepartureTime(initialRide.departure_time || '07:15');
      setPickup(initialRide.origin || '');
      setDestination(initialRide.destination || '');
      setTransportMode(initialRide.transport_mode || 'cab');
      setAvailableSeats(initialRide.available_seats);
      const occupied = Math.max(1, (initialRide.total_seats || 1) - (initialRide.available_seats || 0));
      setFilledSeats(occupied);
      setNotes(initialRide.notes || '');
    } else {
      setExamShift('FN');
      setDepartureDate(new Date().toISOString().split('T')[0]);
      setDepartureTime('07:15');
      setPickup('');
      setDestination('');
      setTransportMode('cab');
      setAvailableSeats(2);
      setFilledSeats(1);
      setNotes('');
    }
  }, [initialRide, isOpen]);

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

    // Total seats = occupied seats (host + pre-filled peers) + available seats
    const total = Number(filledSeats) + Number(availableSeats);

    if (isEditing && initialRide && onUpdateRide) {
      onUpdateRide(initialRide.id, {
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
        notes: notes.trim() || undefined,
      });
    } else {
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
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full sm:max-w-lg bg-[#121522] border-t sm:border border-white/[0.12] rounded-t-3xl sm:rounded-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] overflow-hidden relative">
        {/* Top subtle gradient highlight line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#1E88E5] via-[#8b5cf6] to-[#10b981]" />

        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0 bg-[#121522]/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E88E5]/20 to-[#8b5cf6]/20 border border-[#1E88E5]/30 text-[#1E88E5] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-[#60a5fa]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isEditing ? 'Edit Published Ride' : 'Post a Convoy Ride'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Exam Shift Toggle */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Exam Shift
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleShiftChange('FN')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  examShift === 'FN'
                    ? 'border-[#8b5cf6] bg-[#8b5cf6]/15 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                    : 'border-white/[0.08] bg-[#0c0e17] text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">Forenoon (FN)</span>
                  <span className="text-[10px] text-[#c084fc] font-mono font-semibold">9 AM – 12 PM</span>
                </div>
                <span className="text-[11px] text-gray-400 block">Departs early morning (~7:15 AM)</span>
              </button>

              <button
                type="button"
                onClick={() => handleShiftChange('AN')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  examShift === 'AN'
                    ? 'border-[#8b5cf6] bg-[#8b5cf6]/15 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                    : 'border-white/[0.08] bg-[#0c0e17] text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">Afternoon (AN)</span>
                  <span className="text-[10px] text-[#c084fc] font-mono font-semibold">2 PM – 5 PM</span>
                </div>
                <span className="text-[11px] text-gray-400 block">Departs midday (~12:15 PM)</span>
              </button>
            </div>
          </div>

          {/* 2. Date & Departure Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                required
                className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Departure Time
              </label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
                className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all"
              />
            </div>
          </div>

          {/* 3. Route: Pickup & Destination */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Pickup Spot
              </label>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="e.g. Estancia Gate, SRM Arch Gate, Potheri Stn"
                required
                className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
              />

              {/* Quick Pickups */}
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto text-[11px] pt-2">
                <span className="text-gray-500 shrink-0 text-[11px] font-medium">Quick:</span>
                {COMMON_PICKUPS.map((spot) => (
                  <button
                    key={spot}
                    type="button"
                    onClick={() => setPickup(spot)}
                    className={`px-2.5 py-1 rounded-full text-[11px] border transition-all shrink-0 cursor-pointer ${
                      pickup === spot
                        ? 'bg-[#1E88E5]/20 border-[#1E88E5]/50 text-[#60a5fa] font-bold'
                        : 'bg-[#0c0e17] text-gray-400 hover:text-white border-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    {spot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Exam Center / Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Chengalpattu, Ambattur, Sholinganallur..."
                required
                className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* 4. Mode of Transport */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Mode of Transport
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTransportMode('cab')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs gap-1.5 transition-all cursor-pointer ${
                  transportMode === 'cab'
                    ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'border-white/[0.08] bg-[#0c0e17] text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <CarTaxiFront className="w-4 h-4 text-amber-400" />
                <span className="text-[11px]">Cab / Auto</span>
              </button>

              <button
                type="button"
                onClick={() => setTransportMode('bus')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs gap-1.5 transition-all cursor-pointer ${
                  transportMode === 'bus'
                    ? 'border-blue-500/50 bg-blue-500/20 text-blue-300 font-bold shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'border-white/[0.08] bg-[#0c0e17] text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Bus className="w-4 h-4 text-blue-400" />
                <span className="text-[11px]">Bus</span>
              </button>

              <button
                type="button"
                onClick={() => setTransportMode('train')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs gap-1.5 transition-all cursor-pointer ${
                  transportMode === 'train'
                    ? 'border-purple-500/50 bg-purple-500/20 text-purple-300 font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'border-white/[0.08] bg-[#0c0e17] text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <TrainFront className="w-4 h-4 text-purple-400" />
                <span className="text-[11px]">Train</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransportMode('private_vehicle');
                  setAvailableSeats(1);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs gap-1.5 transition-all cursor-pointer ${
                  transportMode === 'private_vehicle'
                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'border-white/[0.08] bg-[#0c0e17] text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Bike className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px]">Two-Wheeler</span>
              </button>
            </div>
          </div>

          {/* 5. Seats Breakdown Steppers */}
          <div className="p-4 rounded-2xl bg-[#0c0e17] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#1E88E5]" />
                Seats Breakdown
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Total Capacity:{' '}
                <strong className="text-white font-mono">{Number(filledSeats) + Number(availableSeats)} seats</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* Available Seats Stepper */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1.5 font-medium">
                  Available for peers
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAvailableSeats(Math.max(1, availableSeats - 1))}
                    className="w-9 h-9 rounded-xl bg-[#191e2e] border border-white/[0.08] hover:border-white/20 text-white font-bold text-base flex items-center justify-center hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-base text-white font-mono">
                    {availableSeats}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAvailableSeats(Math.min(6, availableSeats + 1))}
                    className="w-9 h-9 rounded-xl bg-[#191e2e] border border-white/[0.08] hover:border-white/20 text-white font-bold text-base flex items-center justify-center hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Occupied Seats Stepper */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1.5 font-medium">
                  Occupied (host included)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFilledSeats(Math.max(1, filledSeats - 1))}
                    className="w-9 h-9 rounded-xl bg-[#191e2e] border border-white/[0.08] hover:border-white/20 text-white font-bold text-base flex items-center justify-center hover:bg-white/[0.08] transition-all cursor-pointer"
                    title="Minimum 1 (host is always included)"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-base text-white font-mono">
                    {filledSeats}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFilledSeats(Math.min(6, filledSeats + 1))}
                    className="w-9 h-9 rounded-xl bg-[#191e2e] border border-white/[0.08] hover:border-white/20 text-white font-bold text-base flex items-center justify-center hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 text-center font-medium">
                  Includes host (min 1)
                </p>
              </div>
            </div>
          </div>

          {/* 6. Notes */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Ride Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Leaving sharply at 7:15, splitting auto fare equally, carrying printouts..."
              className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Sticky Actions Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08] sticky bottom-0 bg-[#121522] pb-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2.5 px-5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2.5 px-6 shadow-lg"
            >
              {isEditing ? 'Save Changes' : 'Publish Ride'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
