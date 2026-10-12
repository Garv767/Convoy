import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Lock, MessageCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card w-full max-w-md bg-surface border-border relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <div>
            <h3 className="text-lg font-bold text-text">Request to Join Ride</h3>
            <p className="text-xs text-muted">Send a request to the host</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted hover:text-text hover:bg-surface2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ride Snapshot */}
        <div className="p-3 rounded-xl bg-surface2/60 border border-border/80 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <TransportBadge mode={ride.transport_mode} vehicleType={ride.vehicle_type} size="sm" />
            <span className="text-xs font-semibold text-accent">
              {ride.departure_time} · {ride.departure_date}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-text">
            <span>{ride.origin}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />
            <span>{ride.destination}</span>
          </div>
          {ride.exam_venue && (
            <div className="text-[11px] text-accent2 font-medium">
              Exam Venue: {ride.exam_venue} ({ride.exam_session})
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seats Needed */}
          <div>
            <label className="block text-xs text-text mb-1">Seats Needed</label>
            <select
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="input-field w-full text-xs"
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
            <label className="block text-xs text-text mb-1">Your Pickup Spot / Landmark</label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. In front of SRM Arch Gate tea shop"
              required
              className="input-field w-full text-xs"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs text-text mb-1">Short Message for Host</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Heading for the same exam session! Carrying 1 bag."
              className="input-field w-full text-xs resize-none"
            />
          </div>

          {/* Zero PII Assurance */}
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-2.5 text-xs text-muted">
            <Lock className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p>
              <strong>Privacy Locked:</strong> Your phone number and WhatsApp will stay hidden until the host reviews and accepts your request.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
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
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
