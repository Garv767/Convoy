import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, MapPin, Users } from 'lucide-react';
import { RideListing, UserProfile } from '../types';
import TransportBadge from './TransportBadge';

interface JoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: RideListing | null;
  currentUser: UserProfile;
  onSubmitRequest: (rideId: string, seats: number, landmark: string, message: string) => void;
}

export default function JoinRequestModal({
  isOpen,
  onClose,
  ride,
  currentUser,
  onSubmitRequest,
}: JoinRequestModalProps) {
  const [seats, setSeats] = useState(1);
  const [landmark, setLandmark] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen || !ride) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest(ride.id, seats, landmark.trim(), message.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full sm:max-w-md bg-[#121522] border-t sm:border border-white/[0.12] rounded-t-3xl sm:rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden">
        {/* Top subtle gradient highlight line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#1E88E5] to-[#8b5cf6]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">Request to Join Ride</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ride Snapshot Inset */}
        <div className="p-3.5 rounded-2xl bg-[#0c0e17] border border-white/[0.08] mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <TransportBadge mode={ride.transport_mode} vehicleType={ride.vehicle_type} size="sm" />
            <span className="text-xs font-semibold text-[#60a5fa] font-mono">
              {ride.departure_time} · {ride.departure_date}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white pt-1">
            <span className="truncate">{ride.origin}</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="truncate text-[#c084fc]">{ride.destination}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seats Needed */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Seats Needed
            </label>
            <select
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
            >
              {Array.from({ length: Math.min(ride.available_seats, 4) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'seat' : 'seats'}
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Landmark */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Your Pickup Landmark
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. SRM Arch Gate, Estancia Tower 4..."
              required
              className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Note for Host (Optional)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Carrying small backpack, ready by 7:10 AM"
              className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
            />
          </div>

          <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.05]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero-PII guarantee: Phone & WhatsApp details unlock only when host accepts.</span>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/[0.08]">
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
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
