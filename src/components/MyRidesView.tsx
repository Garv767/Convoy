import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  AlertCircle,
  ArrowRight,
  Car,
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
}

export default function MyRidesView({
  currentUser,
  rides,
  requests,
  onAcceptRequest,
  onRejectRequest,
  onOpenCreateModal,
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
    <div className="space-y-8">
      {/* SECTION 1: INCOMING REQUESTS (Host Approval Handshake) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              Incoming Join Requests ({incomingRequests.length})
            </h2>
            <p className="text-xs text-muted">
              Review and approve students who want to ride with you. Contact info unlocks upon acceptance.
            </p>
          </div>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-surface/50 border border-border/60 text-muted text-xs">
            No incoming requests yet. When peers request to join your rides, they will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingRequests.map((req) => {
              const targetRide = hostedRides.find((r) => r.id === req.ride_id);
              return (
                <div
                  key={req.id}
                  className="card border-border/80 bg-surface/90 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Passenger snapshot */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-text">
                            {req.passenger_name}
                          </span>
                          <ShieldCheck className="w-4 h-4 text-green"  />
                        </div>
                        <p className="text-xs text-muted font-mono">
                          {req.passenger_gender.toUpperCase()} · {req.passenger_department}
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          req.status === 'accepted'
                            ? 'bg-green/15 text-green border border-green/30'
                            : req.status === 'rejected'
                            ? 'bg-red/15 text-red border border-red/30'
                            : 'bg-yellow/15 text-yellow border border-yellow/30'
                        }`}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Ride Context */}
                    {targetRide && (
                      <div className="p-2.5 rounded-lg bg-surface2/60 border border-border/80 text-xs mb-3 space-y-1">
                        <div className="flex items-center justify-between text-muted">
                          <span>Target Ride:</span>
                          <span className="text-accent font-medium">
                            {targetRide.departure_time} · {targetRide.origin} ➔ {targetRide.destination}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted">
                          Requested: <strong className="text-text">{req.seats_requested} seat(s)</strong>
                        </div>
                      </div>
                    )}

                    {/* Landmark & Message */}
                    {req.pickup_landmark && (
                      <p className="text-xs text-text mb-2">
                        <strong className="text-muted">Pickup Landmark:</strong> {req.pickup_landmark}
                      </p>
                    )}
                    {req.message && (
                      <p className="text-xs text-muted italic bg-surface2/30 p-2 rounded border border-border/40 mb-3">
                        "{req.message}"
                      </p>
                    )}
                  </div>

                  {/* Actions / Contact Reveal */}
                  <div className="pt-3 border-t border-border/80">
                    {req.status === 'pending' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onRejectRequest(req.id)}
                          className="py-2 px-3 rounded-lg border border-red/40 hover:bg-red/10 text-red text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </button>
                        <button
                          onClick={() => onAcceptRequest(req.id)}
                          className="py-2 px-3 rounded-lg bg-green hover:bg-green/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept & Unlock
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
                              `Hey ${req.passenger_name}! I accepted your Convoy ride request.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 px-3 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat with Passenger on WhatsApp
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-red text-center">Request was declined</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: MY OUTGOING REQUESTS (Your Status as Passenger) */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent2" />
            Your Ride Requests ({outgoingRequests.length})
          </h2>
          <p className="text-xs text-muted">
            Track requests you sent to other hosts. Once accepted, their WhatsApp link will appear.
          </p>
        </div>

        {outgoingRequests.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-surface/50 border border-border/60 text-muted text-xs">
            You haven't requested to join any rides yet. Browse the All Rides or Exam Transit tabs!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outgoingRequests.map((req) => {
              const targetRide = rides.find((r) => r.id === req.ride_id);
              return (
                <div key={req.id} className="card border-border/80 bg-surface/90">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-medium text-muted">Ride Target:</span>
                      <p className="text-sm font-semibold text-text">
                        {targetRide ? `${targetRide.origin} ➔ ${targetRide.destination}` : 'SRM Ride'}
                      </p>
                      {targetRide && (
                        <p className="text-xs text-accent">
                          {targetRide.departure_time} · {targetRide.departure_date}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
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
                    <div className="mt-3 p-3 rounded-xl bg-green/10 border border-green/30 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-green font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Accepted! Host contact is now revealed.</span>
                      </div>
                      <a
                        href={`https://wa.me/919876543210?text=${encodeURIComponent(
                          `Hey! I'm your Convoy co-passenger from ${targetRide?.origin} to ${targetRide?.destination}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Connect with Host on WhatsApp
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
          <div>
            <h2 className="text-lg font-bold text-text flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green" />
              Rides You Are Hosting ({hostedRides.length})
            </h2>
            <p className="text-xs text-muted">Active listings you have published.</p>
          </div>
          <button onClick={onOpenCreateModal} className="btn-primary text-xs py-1.5 px-3">
            + Post Another Ride
          </button>
        </div>

        {hostedRides.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-surface/50 border border-border/60 text-muted text-xs">
            You haven't posted any rides yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hostedRides.map((ride) => (
              <div key={ride.id} className="card border-border/80 bg-surface/90">
                <div className="flex items-center justify-between mb-2">
                  <TransportBadge mode={ride.transport_mode} vehicleType={ride.vehicle_type} size="sm" />
                  <span className="text-xs text-muted">
                    {ride.available_seats} of {ride.total_seats} seats left
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-text mb-2">
                  <span>{ride.origin}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span>{ride.destination}</span>
                </div>
                <div className="text-xs text-muted flex items-center justify-between">
                  <span>{ride.departure_time} · {ride.departure_date}</span>
                  <span className="font-semibold text-accent capitalize">{ride.fare_type} fare</span>
                </div>
                {ride.exam_venue && (
                  <div className="mt-2 text-xs text-accent2 bg-accent2/10 p-2 rounded border border-accent2/20">
                    Exam: {ride.exam_venue} ({ride.exam_session})
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
