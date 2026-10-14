import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-surface border-t sm:border border-border rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/70 mb-4">
          <h3 className="text-base font-bold text-text">Request to Join</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ride Snapshot */}
        <div className="p-3 rounded-xl bg-surface2/60 border border-border/70 mb-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <TransportBadge mode={ride.transport_mode} vehicleType={ride.vehicle_type} size="sm" />
            <span className="text-xs font-semibold text-accent">
              {ride.departure_time} · {ride.departure_date}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
            <span>{ride.origin}</span>
            <ArrowRight className="w-3 h-3 text-muted shrink-0" />
            <span>{ride.destination}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Seats Needed */}
          <div>
            <label className="block text-xs font-medium text-text mb-1">Seats Needed</label>
            <select
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="input-field w-full text-xs py-2"
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
            <label className="block text-xs font-medium text-text mb-1">Pickup Spot / Landmark</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. SRM Arch Gate, Estancia Tower 4..."
              required
              className="input-field w-full text-xs"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-text mb-1">Message for Host (Optional)</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Carrying one small bag"
              className="input-field w-full text-xs"
            />
          </div>

          <div className="text-[11px] text-muted flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green shrink-0" />
            <span>Phone & WhatsApp details are only shared once accepted.</span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border/70">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-5"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
