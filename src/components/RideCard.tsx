import React from 'react';
import {
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { RideListing, UserProfile, RequestStatus, UnlockedContact } from '../types';
import TransportBadge from './TransportBadge';

interface RideCardProps {
  ride: RideListing;
  currentUser: UserProfile | null;
  userRequestStatus?: RequestStatus;
  unlockedContacts?: UnlockedContact[];
  onRequestJoin: (ride: RideListing) => void;
}

export default function RideCard({
  ride,
  currentUser,
  userRequestStatus,
  unlockedContacts,
  onRequestJoin,
}: RideCardProps) {
  const isHost = currentUser?.id === ride.host_id;
  const isAccepted = userRequestStatus === 'accepted';
  const isPending = userRequestStatus === 'pending';
  const isFull = ride.available_seats <= 0;

  // Format date readable
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
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

  return (
    <div className="card card-hover flex flex-col justify-between border-border/80 bg-surface/90 relative overflow-hidden group">
      {/* Glow gradient accent on card hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none group-hover:bg-accent/15 transition-all" />

      <div>
        {/* Top Header: Category / Mode / Seats */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <TransportBadge mode={ride.transport_mode} vehicleType={ride.vehicle_type} />
            {ride.ride_category === 'exam' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-semibold bg-accent2/15 text-accent2 border border-accent2/30">
                <GraduationCap className="w-3.5 h-3.5" />
                Exam Transit
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-medium text-muted bg-surface2/80 px-2.5 py-1 rounded-full border border-border">
            <Users className="w-3.5 h-3.5 text-accent" />
            <span className={ride.available_seats === 0 ? 'text-red font-semibold' : 'text-text'}>
              {ride.available_seats} of {ride.total_seats} left
            </span>
          </div>
        </div>

        {/* Route Row: Origin to Destination */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-accent/20 shrink-0" />
            <span className="text-sm font-semibold text-text truncate">{ride.origin}</span>
          </div>
          <div className="ml-1 pl-2.5 border-l-2 border-dashed border-border/60 py-0.5 text-xs text-muted flex items-center gap-1">
            <ArrowRight className="w-3 h-3 text-muted" />
            <span>heading to</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green ring-4 ring-green/20 shrink-0" />
            <span className="text-sm font-semibold text-text truncate">{ride.destination}</span>
          </div>
        </div>

        {/* Exam Specific Callout: Session & Venue (Text Field) */}
        {ride.ride_category === 'exam' && (
          <div className="mb-4 p-3 rounded-lg bg-surface2/60 border border-accent2/25 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted">Exam Session:</span>
              <span className="font-semibold px-2 py-0.5 rounded bg-accent2/20 text-accent2">
                {ride.exam_session === 'FN' ? 'Forenoon (FN) · 9:00 AM - 12:00 PM' : 'Afternoon (AN) · 1:30 PM - 4:30 PM'}
              </span>
            </div>
            {ride.exam_venue && (
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted shrink-0">Venue / Hall:</span>
                <span className="font-medium text-text text-right">{ride.exam_venue}</span>
              </div>
            )}
            {ride.exam_course_code && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Course Code:</span>
                <span className="font-mono text-text">{ride.exam_course_code}</span>
              </div>
            )}
          </div>
        )}

        {/* Timing & Cost Pills */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-surface2/40 border border-border/60">
            <Clock className="w-3.5 h-3.5 text-accent" />
            <div>
              <p className="font-medium text-text">{ride.departure_time}</p>
              <p className="text-[10px] text-muted">{formatDate(ride.departure_date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-surface2/40 border border-border/60">
            <Sparkles className="w-3.5 h-3.5 text-yellow" />
            <div>
              <p className="font-medium text-text capitalize">
                {ride.fare_type === 'split'
                  ? `Split Fare ${ride.estimated_cost_inr ? `(~₹${ride.estimated_cost_inr})` : ''}`
                  : ride.fare_type === 'free'
                  ? 'Free Ride'
                  : `₹${ride.estimated_cost_inr} / seat`}
              </p>
              <p className="text-[10px] text-muted">Cost distribution</p>
            </div>
          </div>
        </div>

        {/* Notes (if any) */}
        {ride.notes && (
          <p className="text-xs text-muted line-clamp-2 italic mb-4 bg-surface2/20 p-2 rounded border border-border/40">
            "{ride.notes}"
          </p>
        )}

        {/* Verified Host Badge & Masked Privacy Note */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green shrink-0" />
            <span className="text-muted">
              {ride.host_gender === 'female' ? 'Female Host' : ride.host_gender === 'male' ? 'Male Host' : 'Host'} ·{' '}
              {ride.host_department}
            </span>
          </div>

          {ride.gender_preference !== 'any' && (
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                ride.gender_preference === 'female_only'
                  ? 'bg-accent2/20 text-accent2 border border-accent2/30'
                  : 'bg-accent/20 text-accent border border-accent/30'
              }`}
            >
              {ride.gender_preference === 'female_only' ? 'Women Only' : 'Men Only'}
            </span>
          )}
        </div>
      </div>

      {/* Unlocked Contact Details (Bilateral reveal upon acceptance) */}
      {(isHost || isAccepted) && hostContact && (
        <div className="mb-4 p-3 rounded-xl bg-green/10 border border-green/30 text-xs">
          <div className="flex items-center gap-1.5 text-green font-semibold mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ride Confirmed · Contact Unlocked</span>
          </div>
          <div className="space-y-1.5 text-text">
            <div className="flex justify-between">
              <span className="text-muted">Host Name:</span>
              <span className="font-medium">{hostContact.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Phone Number:</span>
              <span className="font-mono">{hostContact.phone_number}</span>
            </div>
          </div>
          {hostContact.whatsapp_number && (
            <a
              href={`https://wa.me/${hostContact.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hey ${hostContact.full_name}, I matched with your Convoy ride from ${ride.origin} to ${ride.destination}!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full py-2 px-3 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          )}
        </div>
      )}

      {/* Bottom Action Area */}
      <div>
        {isHost ? (
          <div className="w-full py-2 px-3 rounded-lg bg-surface2 border border-border text-center text-xs font-medium text-accent">
            Your Hosted Ride
          </div>
        ) : isAccepted ? (
          <div className="w-full py-2 px-3 rounded-lg bg-green/15 border border-green/30 text-center text-xs font-semibold text-green flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Request Accepted
          </div>
        ) : isPending ? (
          <div className="w-full py-2 px-3 rounded-lg bg-yellow/15 border border-yellow/30 text-center text-xs font-medium text-yellow">
            Request Pending Host Approval
          </div>
        ) : isFull ? (
          <div className="w-full py-2 px-3 rounded-lg bg-surface2 border border-border text-center text-xs font-medium text-muted">
            Ride Full (0 seats left)
          </div>
        ) : (
          <button
            onClick={() => onRequestJoin(ride)}
            className="btn-primary w-full text-xs py-2 gap-1.5"
          >
            <span>Request to Join</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
