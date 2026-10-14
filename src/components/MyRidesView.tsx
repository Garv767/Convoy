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
    <div className="space-y-6 sm:space-y-8">
      {/* Profile Overview Card with Edit Profile */}
      <div className="card p-4 sm:p-5 border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 text-accent font-bold text-lg flex items-center justify-center shrink-0">
            {currentUser.full_name ? currentUser.full_name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-text">
                {currentUser.full_name}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green bg-green/10 border border-green/30 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-xs text-muted flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              <span>{currentUser.user_net_id}@srmist.edu.in</span>
              <span className="text-muted/40">·</span>
              <span>{currentUser.department}</span>
              <span className="text-muted/40">·</span>
              <span>Year {currentUser.year_of_study}</span>
              {currentUser.phone_number && (
                <>
                  <span className="text-muted/40">·</span>
                  <span className="font-mono">{currentUser.phone_number}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {onEditProfile && (
          <button
            onClick={onEditProfile}
            className="btn-secondary text-xs py-2 px-3.5 gap-1.5 flex items-center self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-accent" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* SECTION 1: INCOMING REQUESTS */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text">
              Incoming Requests
            </h2>
            {incomingRequests.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-white">
                {incomingRequests.length}
              </span>
            )}
          </div>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-surface/60 border border-border text-muted text-xs">
            No incoming passenger requests at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {incomingRequests.map((req) => {
              const targetRide = hostedRides.find((r) => r.id === req.ride_id);
              return (
                <div
                  key={req.id}
                  className="card border-border bg-surface flex flex-col justify-between p-4"
                >
                  <div>
                    {/* Header: Passenger snapshot */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-text">
                            {req.passenger_name}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-green" />
                        </div>
                        <p className="text-xs text-muted">
                          {req.passenger_gender ? `${req.passenger_gender.toUpperCase()} · ` : ''}
                          {req.passenger_department || 'SRMIST'}
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          req.status === 'accepted'
                            ? 'bg-green/15 text-green border border-green/30'
                            : req.status === 'rejected'
                            ? 'bg-red/15 text-red border border-red/30'
                            : 'bg-yellow/15 text-yellow border border-yellow/30'
                        }`}
                      >
                        {req.status === 'accepted' ? 'Accepted' : req.status === 'rejected' ? 'Declined' : 'Pending'}
                      </span>
                    </div>

                    {/* Ride Context */}
                    {targetRide && (
                      <div className="p-2 rounded-lg bg-surface2/60 border border-border text-xs mb-2.5">
                        <div className="flex items-center justify-between text-muted mb-0.5">
                          <span>Route:</span>
                          <span className="text-text font-medium">
                            {targetRide.origin} ➔ {targetRide.destination}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span>Departure: {targetRide.departure_time}</span>
                          <span>{req.seats_requested} seat(s)</span>
                        </div>
                      </div>
                    )}

                    {/* Landmark & Message */}
                    {req.pickup_landmark && (
                      <p className="text-xs text-text mb-1.5">
                        <span className="text-muted">Pickup: </span>
                        {req.pickup_landmark}
                      </p>
                    )}
                    {req.message && (
                      <p className="text-xs text-muted/90 bg-surface2/30 px-2 py-1.5 rounded border border-border/40 mb-3">
                        "{req.message}"
                      </p>
                    )}
                  </div>

                  {/* Actions / Contact Reveal */}
                  <div className="pt-2.5 border-t border-border">
                    {req.status === 'pending' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onRejectRequest(req.id)}
                          className="py-1.5 px-3 rounded-lg border border-red/40 hover:bg-red/10 text-red text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                        <button
                          onClick={() => onAcceptRequest(req.id)}
                          className="py-1.5 px-3 rounded-lg bg-green hover:bg-green/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept
                        </button>
                      </div>
                    ) : req.status === 'accepted' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-text">
                          <span className="text-muted">Phone:</span>
                          <span className="font-mono">{req.passenger_phone || '+91 98765 43210'}</span>
                        </div>
                        {req.passenger_whatsapp && (
                          <a
                            href={`https://wa.me/${req.passenger_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hey ${req.passenger_name}! Connected via Convoy for the ride.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp Passenger
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-red text-center">Request declined</p>
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text">
              Your Sent Requests
            </h2>
            {outgoingRequests.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface2 border border-border text-muted">
                {outgoingRequests.length}
              </span>
            )}
          </div>
        </div>

        {outgoingRequests.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-surface/60 border border-border text-muted text-xs">
            You haven't requested to join any rides yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {outgoingRequests.map((req) => {
              const targetRide = rides.find((r) => r.id === req.ride_id);
              return (
                <div key={req.id} className="card border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <p className="text-sm font-semibold text-text">
                        {targetRide ? `${targetRide.origin} ➔ ${targetRide.destination}` : 'Ride Request'}
                      </p>
                      {targetRide && (
                        <p className="text-xs text-muted">
                          {targetRide.departure_time} · {targetRide.departure_date}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        req.status === 'accepted'
                          ? 'bg-green/15 text-green border border-green/30'
                          : req.status === 'rejected'
                          ? 'bg-red/15 text-red border border-red/30'
                          : 'bg-yellow/15 text-yellow border border-yellow/30'
                      }`}
                    >
                      {req.status === 'accepted' ? 'Accepted' : req.status === 'rejected' ? 'Declined' : 'Pending'}
                    </span>
                  </div>

                  {req.status === 'accepted' && (
                    <div className="mt-3 p-2.5 rounded-lg bg-green/10 border border-green/20 space-y-2 text-xs">
                      <div className="text-green font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Accepted by host</span>
                      </div>
                      <a
                        href={`https://wa.me/919876543210?text=${encodeURIComponent(
                          `Hey! I'm your Convoy passenger from ${targetRide?.origin} to ${targetRide?.destination}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-black font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Chat with Host
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text">
              Rides You're Hosting
            </h2>
            {hostedRides.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface2 border border-border text-muted">
                {hostedRides.length}
              </span>
            )}
          </div>
          <button
            onClick={onOpenCreateModal}
            className="btn-secondary text-xs py-1.5 px-3 gap-1 flex items-center"
          >
            <Plus className="w-3 h-3" />
            <span>Post Ride</span>
          </button>
        </div>

        {hostedRides.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-surface/60 border border-border text-muted text-xs">
            You haven't posted any rides yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {hostedRides.map((ride) => (
              <div key={ride.id} className="card border-border bg-surface p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <TransportBadge mode={ride.transport_mode} vehicleType={ride.vehicle_type} size="sm" />
                    <span className="text-xs text-muted">
                      {ride.available_seats} of {ride.total_seats} seats left
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-text mb-1.5">
                    <span>{ride.origin}</span>
                    <ArrowRight className="w-3 h-3 text-muted shrink-0" />
                    <span>{ride.destination}</span>
                  </div>
                  <div className="text-xs text-muted flex items-center justify-between">
                    <span>{ride.departure_time} · {ride.departure_date}</span>
                    <span className="font-semibold text-text capitalize">{ride.fare_type}</span>
                  </div>
                </div>

                {onEditRide && (
                  <div className="mt-3 pt-3 border-t border-border flex justify-end">
                    <button
                      type="button"
                      onClick={() => onEditRide(ride)}
                      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
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
