'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RideCard from '../components/RideCard';
import CreateRideModal from '../components/CreateRideModal';
import JoinRequestModal from '../components/JoinRequestModal';
import MyRidesView from '../components/MyRidesView';
import ExamTransitBanner from '../components/ExamTransitBanner';
import TransportBadge from '../components/TransportBadge';
import {
  RideListing,
  RideRequest,
  UserProfile,
  TransportMode,
  GenderPreference,
  ExamSession,
  UnlockedContact,
} from '../types';
import { INITIAL_RIDES, INITIAL_REQUESTS, INITIAL_USER } from '../lib/mockData';
import {
  Search,
  Filter,
  Plus,
  Bus,
  TrainFront,
  CarTaxiFront,
  Bike,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Users,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | 'exam' | 'my-rides'>('all');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [rides, setRides] = useState<RideListing[]>(INITIAL_RIDES);
  const [requests, setRequests] = useState<RideRequest[]>(INITIAL_REQUESTS);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<'all' | TransportMode>('all');
  const [selectedGenderPref, setSelectedGenderPref] = useState<'all' | GenderPreference>('all');
  
  // Exam Filters
  const [selectedExamSession, setSelectedExamSession] = useState<'all' | ExamSession>('all');
  const [venueSearch, setVenueSearch] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRideForJoin, setSelectedRideForJoin] = useState<RideListing | null>(null);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedRides = localStorage.getItem('convoy_rides');
      if (savedRides) setRides(JSON.parse(savedRides));

      const savedRequests = localStorage.getItem('convoy_requests');
      if (savedRequests) setRequests(JSON.parse(savedRequests));
    } catch {
      // Fallback to initial
    }
  }, []);

  // Sync to localStorage
  const saveRidesState = (updated: RideListing[]) => {
    setRides(updated);
    try {
      localStorage.setItem('convoy_rides', JSON.stringify(updated));
    } catch {}
  };

  const saveRequestsState = (updated: RideRequest[]) => {
    setRequests(updated);
    try {
      localStorage.setItem('convoy_requests', JSON.stringify(updated));
    } catch {}
  };

  // Create Ride
  const handleCreateRide = (
    newRideData: Omit<RideListing, 'id' | 'created_at' | 'status'>
  ) => {
    const newRide: RideListing = {
      ...newRideData,
      id: `ride_${Date.now()}`,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    const updated = [newRide, ...rides];
    saveRidesState(updated);
  };

  // Submit Join Request
  const handleSubmitRequest = (
    rideId: string,
    seats: number,
    landmark: string,
    message: string
  ) => {
    const newRequest: RideRequest = {
      id: `req_${Date.now()}`,
      ride_id: rideId,
      passenger_id: currentUser.id,
      passenger_net_id: currentUser.user_net_id,
      passenger_name: currentUser.full_name,
      passenger_gender: currentUser.gender,
      passenger_department: currentUser.department,
      passenger_phone: currentUser.phone_number,
      passenger_whatsapp: currentUser.whatsapp_number,
      seats_requested: seats,
      pickup_landmark: landmark,
      message,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const updated = [newRequest, ...requests];
    saveRequestsState(updated);
  };

  // Accept Request (Host Action)
  const handleAcceptRequest = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    // 1. Update request status to accepted
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status: 'accepted' as const } : r
    );
    saveRequestsState(updatedRequests);

    // 2. Decrement available seats in corresponding ride
    const updatedRides = rides.map((ride) => {
      if (ride.id === req.ride_id) {
        const remaining = Math.max(0, ride.available_seats - req.seats_requested);
        return {
          ...ride,
          available_seats: remaining,
          status: remaining === 0 ? ('full' as const) : ride.status,
        };
      }
      return ride;
    });
    saveRidesState(updatedRides);
  };

  // Reject Request (Host Action)
  const handleRejectRequest = (requestId: string) => {
    const updatedRequests = requests.map((r) =>
      r.id === requestId ? { ...r, status: 'rejected' as const } : r
    );
    saveRequestsState(updatedRequests);
  };

  // Filter rides based on active tab and search
  const filteredRides = rides.filter((ride) => {
    // Tab filter
    if (activeTab === 'exam' && ride.ride_category !== 'exam') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesRoute =
        ride.origin.toLowerCase().includes(q) ||
        ride.destination.toLowerCase().includes(q) ||
        ride.vehicle_type?.toLowerCase().includes(q);
      if (!matchesRoute) return false;
    }

    // Transport Mode
    if (selectedMode !== 'all' && ride.transport_mode !== selectedMode) return false;

    // Gender preference
    if (selectedGenderPref !== 'all' && ride.gender_preference !== selectedGenderPref)
      return false;

    // Exam specific filters
    if (activeTab === 'exam') {
      if (selectedExamSession !== 'all' && ride.exam_session !== selectedExamSession)
        return false;
      if (venueSearch.trim()) {
        const v = venueSearch.toLowerCase();
        const matchesVenue = ride.exam_venue?.toLowerCase().includes(v);
        if (!matchesVenue) return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        user={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'my-rides' ? (
          <MyRidesView
            currentUser={currentUser}
            rides={rides}
            requests={requests}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div>
            {/* Exam Banner if Exam Transit is active */}
            {activeTab === 'exam' && (
              <ExamTransitBanner
                selectedSession={selectedExamSession}
                setSelectedSession={setSelectedExamSession}
                venueSearch={venueSearch}
                setVenueSearch={setVenueSearch}
                onPostExamRide={() => setIsCreateModalOpen(true)}
              />
            )}

            {/* General Header & Hero (When All Rides is active) */}
            {activeTab === 'all' && (
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-text tracking-tight flex items-center gap-2">
                    SRMIST Campus Commute Feed
                  </h1>
                  <p className="text-xs sm:text-sm text-muted">
                    Verified rides across Potheri, Estancia, Abode, Tambaram, Airport, and Chennai city.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2/60 border border-border text-xs text-muted">
                    <ShieldCheck className="w-4 h-4 text-green" />
                    <span>Zero Public PII Guarantee</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filters & Search Toolbar */}
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                {/* Search Origin / Destination */}
                <div className="sm:col-span-6 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by origin or destination (e.g. Estancia, Potheri, Central)..."
                    className="input-field w-full pl-9 text-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-muted hover:text-text"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Transport Mode Filter (Vector SVGs) */}
                <div className="sm:col-span-4 flex items-center gap-1 bg-surface2/80 p-1 rounded-xl border border-border overflow-x-auto">
                  <button
                    onClick={() => setSelectedMode('all')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedMode === 'all'
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    All Modes
                  </button>
                  <button
                    onClick={() => setSelectedMode('cab')}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedMode === 'cab'
                        ? 'bg-yellow/20 text-yellow border border-yellow/30'
                        : 'text-muted hover:text-text'
                    }`}
                    title="Cab / Auto"
                  >
                    <CarTaxiFront className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedMode('bus')}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedMode === 'bus'
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'text-muted hover:text-text'
                    }`}
                    title="Bus / Shuttle"
                  >
                    <Bus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedMode('train')}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedMode === 'train'
                        ? 'bg-accent2/20 text-accent2 border border-accent2/30'
                        : 'text-muted hover:text-text'
                    }`}
                    title="Train / Metro"
                  >
                    <TrainFront className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedMode('private_vehicle')}
                    className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedMode === 'private_vehicle'
                        ? 'bg-green/20 text-green border border-green/30'
                        : 'text-muted hover:text-text'
                    }`}
                    title="Private Vehicle"
                  >
                    <Bike className="w-4 h-4" />
                  </button>
                </div>

                {/* Gender Preference Filter */}
                <div className="sm:col-span-2">
                  <select
                    value={selectedGenderPref}
                    onChange={(e) =>
                      setSelectedGenderPref(e.target.value as 'all' | GenderPreference)
                    }
                    className="input-field w-full text-xs py-2"
                  >
                    <option value="all">Any Gender</option>
                    <option value="female_only">Women Only</option>
                    <option value="male_only">Men Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ride Cards Grid */}
            {filteredRides.length === 0 ? (
              <div className="card text-center py-12 border-dashed border-border/80">
                <Users className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                <h3 className="text-base font-semibold text-text mb-1">
                  No matching rides found
                </h3>
                <p className="text-xs text-muted max-w-sm mx-auto mb-5">
                  Try widening your filters, or be the first to post a ride heading that way!
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary text-xs py-2 px-4 gap-1.5 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Post Ride Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRides.map((ride) => {
                  const existingReq = requests.find(
                    (r) => r.ride_id === ride.id && r.passenger_id === currentUser.id
                  );

                  // Mock unlocked contact if host or accepted
                  const unlockedContacts: UnlockedContact[] =
                    currentUser.id === ride.host_id || existingReq?.status === 'accepted'
                      ? [
                          {
                            user_id: ride.host_id,
                            full_name: 'Verified SRM Host',
                            phone_number: '+91 98765 43210',
                            whatsapp_number: '+919876543210',
                            role: 'host',
                          },
                        ]
                      : [];

                  return (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      currentUser={currentUser}
                      userRequestStatus={existingReq?.status}
                      unlockedContacts={unlockedContacts}
                      onRequestJoin={(targetRide) => setSelectedRideForJoin(targetRide)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-surface/40 py-6 text-center text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text">Convoy</span>
            <span className="text-muted/60">·</span>
            <span>A subdomain companion of <a href="https://unfugly.app" className="text-accent hover:underline">unfugly.app</a></span>
          </div>
          <p className="text-[11px] text-muted/80">
            For SRMIST Students · Secure Supabase SMTP Auth · Zero Public PII
          </p>
        </div>
      </footer>

      {/* Post Ride Modal */}
      <CreateRideModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onCreateRide={handleCreateRide}
      />

      {/* Join Request Modal */}
      <JoinRequestModal
        isOpen={Boolean(selectedRideForJoin)}
        onClose={() => setSelectedRideForJoin(null)}
        ride={selectedRideForJoin}
        currentUser={currentUser}
        onSubmitRequest={handleSubmitRequest}
      />
    </div>
  );
}
