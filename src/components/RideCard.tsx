import React from 'react';
import {
  Clock,
  Users,
  GraduationCap,
  MessageCircle,
  Phone,
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
  // Seats occupied count always includes the host (minimum 1)
  const filledSeats = Math.max(1, ride.total_seats - ride.available_seats);

  return (
    <div className="card card-hover flex flex-col justify-between border-border bg-surface transition-all p-4 sm:p-5">
      <div>
        {/* Top Meta: Mode + Shift Badge + Seats */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <TransportBadge mode={ride.transport_mode} vehicleType={ride.vehicle_type} size="sm" />
            {ride.exam_session && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-accent2/15 text-accent2 border border-accent2/30">
                <GraduationCap className="w-3 h-3" />
                {ride.exam_session === 'FN' ? 'FN Shift' : 'AN Shift'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted font-medium bg-surface2 px-2.5 py-1 rounded-lg border border-border">
            <Users className="w-3 h-3 text-accent" />
            <span className={ride.available_seats === 0 ? 'text-red font-semibold' : 'text-text'}>
              {ride.available_seats} of {ride.total_seats} seats left
            </span>
          </div>
        </div>

        {/* Route Stream: Pickup -> NPTEL Center */}
        <div className="relative pl-6 py-1 mb-3.5 space-y-3">
          {/* Timeline Connector Line */}
          <div className="absolute left-2.5 top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-accent via-accent/40 to-green" />

          {/* Pickup */}
          <div className="relative">
            <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-accent/20" />
            <span className="text-[11px] text-muted block -mb-0.5">Pickup</span>
            <p className="text-sm font-semibold text-text leading-tight">{ride.origin}</p>
          </div>

          {/* Destination */}
          <div className="relative">
            <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-green ring-2 ring-green/20" />
            <span className="text-[11px] text-muted block -mb-0.5">Exam Center</span>
            <p className="text-sm font-semibold text-text leading-tight">{ride.destination}</p>
          </div>
        </div>

        {/* Timing Strip */}
        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface2/60 border border-border text-xs mb-3">
          <div className="flex items-center gap-1.5 text-text font-medium">
            <Clock className="w-3.5 h-3.5 text-accent" />
            <span>Departs {ride.departure_time}</span>
            <span className="text-muted">· {formatDate(ride.departure_date)}</span>
          </div>

          <div className="text-xs text-muted">
            {filledSeats > 0 ? `${filledSeats} filled` : 'Open'}
          </div>
        </div>

        {/* Notes if present */}
        {ride.notes && (
          <p className="text-xs text-muted/90 line-clamp-2 mb-3.5 bg-surface2/40 px-2.5 py-1.5 rounded-md border border-border/60">
            "{ride.notes}"
          </p>
        )}

        {/* Host Meta */}
        <div className="flex items-center justify-between text-xs text-muted mb-4 pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-green shrink-0" />
            <span className="truncate">
              {ride.host_gender ? (ride.host_gender === 'female' ? 'Female Host' : 'Male Host') : 'Host'}
              {ride.host_department ? ` · ${ride.host_department}` : ''}
            </span>
          </div>

          <span className="text-[11px] text-muted font-mono">
            Split fare
          </span>
        </div>
      </div>

      {/* Unlocked Contact Details (Upon Acceptance) */}
      {(isHost || isAccepted) && hostContact && (
        <div className="mb-3.5 p-3 rounded-xl bg-green/10 border border-green/30 text-xs space-y-2">
          <div className="flex items-center justify-between text-green font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Contact Unlocked</span>
            </div>
            <span className="font-mono text-text">{hostContact.phone_number}</span>
          </div>
          {hostContact.whatsapp_number && (
            <a
              href={`https://wa.me/${hostContact.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hey ${hostContact.full_name}, connected via Convoy for the NPTEL exam ride to ${ride.destination}!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-black font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          )}
        </div>
      )}

      {/* Primary Action Button */}
      <div>
        {isHost ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 py-2 px-3 rounded-lg bg-surface2 border border-border text-center text-xs font-medium text-accent">
              Your Ride
            </div>
            {onEditRide && (
              <button
                type="button"
                onClick={() => onEditRide(ride)}
                className="btn-secondary py-2 px-3 text-xs gap-1.5 flex items-center shrink-0"
                title="Edit Ride Details"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>
        ) : isAccepted ? (
          <div className="w-full py-2 px-3 rounded-lg bg-green/15 border border-green/30 text-center text-xs font-semibold text-green flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepted
          </div>
        ) : isPending ? (
          <div className="w-full py-2 px-3 rounded-lg bg-yellow/15 border border-yellow/30 text-center text-xs font-medium text-yellow">
            Request Pending
          </div>
        ) : isFull ? (
          <div className="w-full py-2 px-3 rounded-lg bg-surface2 border border-border text-center text-xs font-medium text-muted">
            Ride Full
          </div>
        ) : (
          <button
            onClick={() => onRequestJoin(ride)}
            className="btn-primary w-full text-xs py-2.5 gap-1.5"
          >
            <span>Request Seat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
