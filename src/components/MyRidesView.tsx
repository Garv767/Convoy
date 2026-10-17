import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Plus,
  Edit3,
} from 'lucide-react';
import { RideListing, RideRequest, UserProfile } from '../types';
import TransportBadge from './TransportBadge';

interface MyRidesViewProps {
  currentUser: UserProfile;
  rides: RideListing[];
  requests: RideRequest[];
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
  onOpenCreateModal: () => void;
  onEditProfile?: () => void;
  onEditRide?: (ride: RideListing) => void;
}

export default function MyRidesView({
  currentUser,
  rides,
  requests,
  onAcceptRequest,
  onRejectRequest,
  onOpenCreateModal,
  onEditProfile,
  onEditRide,
}: MyRidesViewProps) {
  // Rides hosted by current user
  const hostedRides = rides.filter((r) => r.host_id === currentUser.id);

  // Incoming requests for hosted rides
  const incomingRequests = requests.filter((req) =>
    hostedRides.some((hr) => hr.id === req.ride_id)
  );

  // Outgoing requests made by current user
  const outgoingRequests = requests.filter(
    (req) => req.passenger_id === currentUser.id
  );

  return (
    <div className="space-y-7 sm:space-y-9">
      {/* Student Profile Card (Unfugly design style) */}
      <div className="relative rounded-3xl bg-[#16181d] border border-white/[0.08] p-5 sm:p-6 shadow-xl overflow-hidden">
        {/* Top Unfugly blue highlight line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-[#1E88E5]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circular Profile Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#1E88E5] bg-[#1E88E5]/20 text-white font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(30,136,229,0.3)]">
              {currentUser.full_name ? currentUser.full_name[0].toUpperCase() : 'U'}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {currentUser.full_name}
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified SRM Student
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                <span className="font-mono text-[#60a5fa] bg-[#1E88E5]/10 border border-[#1E88E5]/25 px-2.5 py-0.5 rounded-full">
                  {currentUser.user_net_id}@srmist.edu.in
                </span>
                <span className="text-gray-400 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
                  {currentUser.department}
                </span>
                <span className="text-gray-400 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
                  Year {currentUser.year_of_study}
                </span>
                {currentUser.phone_number && (
                  <span className="font-mono text-gray-300 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
                    {currentUser.phone_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            {/* Quick Unfugly Community & Extension Links */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
              <a
                href="https://chat.whatsapp.com/GlmnZ3g0Zb8IXFTa3tOImT"
                target="_blank"
                rel="noopener noreferrer"
                title="Join WhatsApp Community"
                className="text-gray-400 hover:text-[#25D366] transition-colors flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.019 14.12 1.01 11.52 1.01c-5.448 0-9.873 4.37-9.878 9.802-.002 1.743.46 3.447 1.34 4.954l-.99 3.614 3.655-.958zm12.335-5.464c-.302-.15-1.786-.882-2.07-.987-.282-.104-.489-.156-.694.15-.205.307-.795.987-.975 1.191-.18.205-.359.23-.66.08-1.597-.799-2.617-1.436-3.666-3.235-.278-.475.278-.44.795-1.474.086-.174.043-.326-.021-.475-.065-.15-.544-1.309-.745-1.792-.195-.47-.393-.406-.54-.413-.14-.007-.301-.008-.461-.008-.161 0-.422.06-.643.302-.221.241-.844.824-.844 2.01 0 1.185.864 2.33 1.025 2.502.161.171 1.7 2.593 4.12 3.633.576.248 1.025.395 1.376.507.579.183 1.106.157 1.522.095.464-.069 1.487-.607 1.695-1.191.208-.585.208-1.087.146-1.191-.063-.105-.23-.156-.53-.307z"/>
                </svg>
              </a>
              <a
                href="https://extension.unfugly.app"
                target="_blank"
                rel="noopener noreferrer"
                title="Chrome Extension"
                className="text-gray-400 hover:text-[#1E88E5] transition-colors flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 512 512" fill="currentColor">
                  <path d="M464 128h-80V80c0-44.18-35.82-80-80-80s-80 35.82-80 80v48h-80c-26.51 0-48 21.49-48 48v80H48c-26.51 0-48 21.49-48 48s21.49 48 48 48h48v80c0 26.51 21.49 48 48 48h80v48c0 44.18 35.82 80 80 80s80-35.82 80-80v-48h80c26.51 0 48-21.49 48-48v-80h48c26.51 0 48-21.49 48-48s-21.49-48-48-48h-48v-80c0-26.51-21.49-48-48-48z"/>
                </svg>
              </a>
            </div>

            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="btn-secondary text-xs py-2 px-4 gap-1.5 flex items-center shadow-sm cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#1E88E5]" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 1: INCOMING PASSENGER REQUESTS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Incoming Passenger Requests
            </h2>
            {incomingRequests.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1E88E5] text-white shadow-sm">
                {incomingRequests.length}
              </span>
            )}
          </div>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#16181d] border border-white/[0.06] text-gray-400 text-xs">
            No incoming passenger requests at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingRequests.map((req) => {
              const targetRide = hostedRides.find((r) => r.id === req.ride_id);
              return (
                <div
                  key={req.id}
                  className="rounded-2xl bg-[#16181d] border border-white/[0.08] hover:border-[#1E88E5]/30 p-5 shadow-lg flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Header: Passenger Identity */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#1E88E5]/20 border border-[#1E88E5]/40 flex items-center justify-center text-xs font-bold text-white">
                          {req.passenger_name ? req.passenger_name[0].toUpperCase() : 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">
                              {req.passenger_name}
                            </span>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <p className="text-xs text-gray-400">
                            {req.passenger_gender ? `${req.passenger_gender.toUpperCase()} · ` : ''}
                            {req.passenger_department || 'SRMIST'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          req.status === 'accepted'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : req.status === 'rejected'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-[#FBC02D]/15 text-[#FBC02D] border-[#FBC02D]/30'
                        }`}
                      >
                        {req.status === 'accepted' ? 'Accepted' : req.status === 'rejected' ? 'Declined' : 'Pending'}
                      </span>
                    </div>

                    {/* Ride Context Inset */}
                    {targetRide && (
                      <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06] text-xs mb-3 space-y-1">
                        <div className="flex items-center justify-between text-gray-400">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Route:</span>
                          <span className="text-white font-semibold">
                            {targetRide.origin} ➔ {targetRide.destination}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
                          <span>Departs: <strong className="text-gray-200">{targetRide.departure_time}</strong></span>
                          <span className="font-mono text-[#60a5fa]">{req.seats_requested} seat(s) requested</span>
                        </div>
                      </div>
                    )}

                    {/* Landmark & Message */}
                    {req.pickup_landmark && (
                      <p className="text-xs text-gray-300 mb-2">
                        <span className="text-gray-500 font-semibold uppercase text-[10px] tracking-wider block">Pickup Spot:</span>
                        {req.pickup_landmark}
                      </p>
                    )}
                    {req.message && (
                      <p className="text-xs text-gray-400 italic bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.05] mb-3">
                        &ldquo;{req.message}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions / Contact Reveal */}
                  <div className="pt-3 border-t border-white/[0.08]">
                    {req.status === 'pending' ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => onRejectRequest(req.id)}
                          className="py-2 px-3 rounded-full border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                        <button
                          onClick={() => onAcceptRequest(req.id)}
                          className="py-2 px-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept & Unlock
                        </button>
                      </div>
                    ) : req.status === 'accepted' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-white">
                          <span className="text-gray-400">Passenger Phone:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {req.passenger_phone || '+91 98765 43210'}
                          </span>
                        </div>
                        {req.passenger_whatsapp && (
                          <a
                            href={`https://wa.me/${req.passenger_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hey ${req.passenger_name}! Connected via Convoy for the ride.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                          >
                            <MessageCircle className="w-4 h-4 fill-black text-transparent" />
                            WhatsApp Passenger
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-rose-400 text-center font-medium">Request declined</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: MY OUTGOING REQUESTS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Your Sent Requests
            </h2>
            {outgoingRequests.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/[0.08] text-gray-300">
                {outgoingRequests.length}
              </span>
            )}
          </div>
        </div>

        {outgoingRequests.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#16181d] border border-white/[0.06] text-gray-400 text-xs">
            You haven't requested to join any rides yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outgoingRequests.map((req) => {
              const targetRide = rides.find((r) => r.id === req.ride_id);
              return (
                <div key={req.id} className="rounded-2xl bg-[#16181d] border border-white/[0.08] p-5 shadow-lg">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {targetRide ? `${targetRide.origin} ➔ ${targetRide.destination}` : 'Ride Request'}
                      </p>
                      {targetRide && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {targetRide.departure_time} · {targetRide.departure_date}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                        req.status === 'accepted'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : req.status === 'rejected'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-[#FBC02D]/15 text-[#FBC02D] border-[#FBC02D]/30'
                      }`}
                    >
                      {req.status === 'accepted' ? 'Accepted' : req.status === 'rejected' ? 'Declined' : 'Pending'}
                    </span>
                  </div>

                  {req.status === 'accepted' && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2.5 text-xs">
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        <span>Accepted by host</span>
                      </div>
                      <a
                        href={`https://wa.me/919876543210?text=${encodeURIComponent(
                          `Hey! I'm your Convoy passenger from ${targetRide?.origin} to ${targetRide?.destination}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-black font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                      >
                        <MessageCircle className="w-4 h-4 fill-black text-transparent" />
                        Chat with Host on WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: MY HOSTED RIDES */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Rides You're Hosting
            </h2>
            {hostedRides.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/[0.08] text-gray-300">
                {hostedRides.length}
              </span>
            )}
          </div>
          <button
            onClick={onOpenCreateModal}
            className="btn-secondary text-xs py-1.5 px-3.5 gap-1.5 flex items-center shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#1E88E5]" />
            <span>Post Ride</span>
          </button>
        </div>

        {hostedRides.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#16181d] border border-white/[0.06] text-gray-400 text-xs">
            You haven't posted any rides yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hostedRides.map((ride) => (
              <div key={ride.id} className="rounded-2xl bg-[#16181d] border border-white/[0.08] p-5 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <TransportBadge mode={ride.transport_mode} vehicleType={ride.vehicle_type} size="sm" />
                    <span className="text-xs font-mono font-medium text-gray-400">
                      {ride.available_seats} of {ride.total_seats} seats left
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                    <span className="truncate">{ride.origin}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="truncate text-gray-200">{ride.destination}</span>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center justify-between">
                    <span>{ride.departure_time} · {ride.departure_date}</span>
                    <span className="font-mono text-[11px] text-[#60a5fa] uppercase">{ride.fare_type}</span>
                  </div>
                </div>

                {onEditRide && (
                  <div className="mt-4 pt-3 border-t border-white/[0.08] flex justify-end">
                    <button
                      type="button"
                      onClick={() => onEditRide(ride)}
                      className="btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#1E88E5]" />
                      <span>Edit Ride</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
