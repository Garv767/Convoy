import React from 'react';
import {
  Clock,
  Users,
  GraduationCap,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import { RideListing, UserProfile, RequestStatus, UnlockedContact } from '../types';
import TransportBadge from './TransportBadge';

interface RideCardProps {
  ride: RideListing;
  currentUser: UserProfile | null;
  userRequestStatus?: RequestStatus;
  unlockedContacts?: UnlockedContact[];
  onRequestJoin: (ride: RideListing) => void;
  onEditRide?: (ride: RideListing) => void;
}

export default function RideCard({
  ride,
  currentUser,
  userRequestStatus,
  unlockedContacts,
  onRequestJoin,
  onEditRide,
}: RideCardProps) {
  const isHost = currentUser?.id === ride.host_id;
  const isAccepted = userRequestStatus === 'accepted';
  const isPending = userRequestStatus === 'pending';
  const isFull = ride.available_seats <= 0;

  // Format date readable
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const today = new Date();
      if (d.toDateString() === today.toDateString()) {
        return 'Today';
      }
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const hostContact = unlockedContacts?.find((c) => c.role === 'host');
  // Occupied seats calculation always includes the host (minimum 1)
  const filledSeats = Math.max(1, ride.total_seats - ride.available_seats);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[#16181d] border border-white/[0.08] hover:border-[#1E88E5]/45 hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.8),0_0_20px_rgba(30,136,229,0.12)] hover:-translate-y-1 transition-all duration-200 p-5 overflow-hidden">
      {/* Top subtle hover accent line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-[#1E88E5] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div>
        {/* Top Header Row: Mode Badge + Shift + Live Seat Pill */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <TransportBadge mode={ride.transport_mode} vehicleType={ride.vehicle_type} size="sm" />
            {ride.exam_session && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#22252c] text-gray-300 border border-[#323642]">
                <GraduationCap className="w-3 h-3 text-[#1E88E5]" />
                {ride.exam_session === 'FN' ? 'FN Shift' : 'AN Shift'}
              </span>
            )}
          </div>

          {/* Seat Status Pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isFull
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : ride.available_seats === 1
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isFull
                  ? 'bg-rose-400'
                  : ride.available_seats === 1
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span>
              {isFull ? 'Ride Full' : `${ride.available_seats} of ${ride.total_seats} seats left`}
            </span>
          </div>
        </div>

        {/* Route Stream: Waypoints */}
        <div className="relative pl-7 py-1 mb-4 space-y-3.5">
          {/* Vertical Route Connector */}
          <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-[#1E88E5] via-slate-700 to-[#10b981]" />

          {/* Origin / Pickup */}
          <div className="relative">
            <div className="absolute -left-7 top-1 w-3 h-3 rounded-full bg-[#1E88E5] border-2 border-[#16181d] shadow-[0_0_8px_rgba(30,136,229,0.8)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Pickup Point
            </span>
            <p className="text-sm font-semibold text-white leading-snug line-clamp-1">
              {ride.origin}
            </p>
          </div>

          {/* Destination */}
          <div className="relative">
            <div className="absolute -left-7 top-1 w-3 h-3 rounded-full bg-[#10b981] border-2 border-[#16181d] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Destination / Center
            </span>
            <p className="text-sm font-bold text-white leading-snug line-clamp-1">
              {ride.destination}
            </p>
          </div>
        </div>

        {/* Departure Timing & Visual Seat Dots Strip */}
        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-[#101216] border border-white/[0.06] text-xs mb-3.5">
          <div className="flex items-center gap-1.5 text-gray-200 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#1E88E5]" />
            <span className="font-semibold text-white">{ride.departure_time}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-400">{formatDate(ride.departure_date)}</span>
          </div>

          {/* Visual Seat Representation */}
          <div className="flex items-center gap-1" title={`${filledSeats} occupied, ${ride.available_seats} open`}>
            {Array.from({ length: Math.min(ride.total_seats, 6) }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < filledSeats
                    ? 'bg-[#1E88E5] shadow-[0_0_5px_rgba(30,136,229,0.5)]'
                    : 'bg-white/10 border border-white/15'
                }`}
              />
            ))}
            <span className="ml-1 text-[11px] text-gray-400 font-mono">
              {filledSeats}/{ride.total_seats}
            </span>
          </div>
        </div>

        {/* Note if provided */}
        {ride.notes && (
          <p className="text-xs text-gray-400 italic line-clamp-2 mb-3.5 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.05]">
            &ldquo;{ride.notes}&rdquo;
          </p>
        )}

        {/* Host Meta Row */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 truncate">
            {/* Host Avatar Ring (Unfugly Blue) */}
            <div className="w-6 h-6 rounded-full bg-[#1E88E5]/20 border border-[#1E88E5]/50 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {ride.host_gender === 'female' ? 'F' : 'M'}
            </div>
            <div className="flex items-center gap-1 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate text-gray-300 font-medium">
                {ride.host_gender ? (ride.host_gender === 'female' ? 'Female Host' : 'Male Host') : 'Host'}
                {ride.host_department ? ` · ${ride.host_department}` : ''}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full shrink-0">
            Split fare
          </span>
        </div>
      </div>

      {/* Unlocked Contact Details (Upon Acceptance) */}
      {(isHost || isAccepted) && hostContact && (
        <div className="mb-3.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-emerald-400 font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Contact Unlocked</span>
            </div>
            <span className="font-mono text-white font-bold">{hostContact.phone_number}</span>
          </div>
          {hostContact.whatsapp_number && (
            <a
              href={`https://wa.me/${hostContact.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hey ${hostContact.full_name}, connected via Convoy for the ride to ${ride.destination}!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-4 h-4 fill-black text-transparent" />
              <span>Chat on WhatsApp</span>
            </a>
          )}
        </div>
      )}

      {/* Action CTA Button */}
      <div>
        {isHost ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 py-2 px-3 rounded-full bg-[#1E88E5]/15 border border-[#1E88E5]/30 text-center text-xs font-semibold text-[#60a5fa]">
              Your Published Ride
            </div>
            {onEditRide && (
              <button
                type="button"
                onClick={() => onEditRide(ride)}
                className="btn-secondary py-2 px-3 text-xs gap-1.5 flex items-center shrink-0 cursor-pointer"
                title="Edit Ride Details"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#1E88E5]" />
                <span>Edit</span>
              </button>
            )}
          </div>
        ) : isAccepted ? (
          <div className="w-full py-2.5 px-3 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Seat Confirmed</span>
          </div>
        ) : isPending ? (
          <div className="w-full py-2.5 px-3 rounded-full bg-amber-500/15 border border-amber-500/30 text-center text-xs font-semibold text-amber-400 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Request Pending Host Approval</span>
          </div>
        ) : isFull ? (
          <div className="w-full py-2.5 px-3 rounded-full bg-white/[0.04] border border-white/[0.08] text-center text-xs font-medium text-gray-500">
            Ride Fully Booked
          </div>
        ) : (
          <button
            onClick={() => onRequestJoin(ride)}
            className="btn-primary w-full text-xs py-2.5 gap-2 shadow-md"
          >
            <span>Request Seat</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
