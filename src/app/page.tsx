'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import RideCard from '../components/RideCard';
import CreateRideModal from '../components/CreateRideModal';
import JoinRequestModal from '../components/JoinRequestModal';
import MyRidesView from '../components/MyRidesView';
import ExamTransitBanner from '../components/ExamTransitBanner';
import ProfileModal from '../components/ProfileModal';
import {
  RideListing,
  RideRequest,
  UserProfile,
  TransportMode,
  GenderPreference,
  ExamSession,
  UnlockedContact,
} from '../types';
import {
  fetchLiveRides,
  fetchUserProfile,
  saveUserProfile,
  createLiveRide,
  submitLiveRequest,
  fetchIncomingRequests,
  fetchOutgoingRequests,
  updateRequestStatus,
  fetchRideContacts,
} from '../lib/api';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  Search,
  Plus,
  Bus,
  TrainFront,
  CarTaxiFront,
  Bike,
  ShieldCheck,
  GraduationCap,
  Users,
  RefreshCw,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'exam' | 'my-rides'>('all');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Live DB State
  const [rides, setRides] = useState<RideListing[]>([]);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [unlockedContactsMap, setUnlockedContactsMap] = useState<Record<string, UnlockedContact[]>>({});
  const [loadingRides, setLoadingRides] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // 1. Auth Listener: Check Supabase session
  useEffect(() => {
    async function checkAuth() {
      if (!isSupabaseConfigured) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email || '';
        const uid = session.user.id;
        setUserEmail(email);
        setUserId(uid);

        const profile = await fetchUserProfile(uid);
        if (profile) {
          setCurrentUser(profile);
        } else {
          // Open profile completion modal
          setIsProfileModalOpen(true);
        }
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const uid = session.user.id;
        setUserEmail(email);
        setUserId(uid);

        const profile = await fetchUserProfile(uid);
        if (profile) {
          setCurrentUser(profile);
          setIsProfileModalOpen(false);
        } else {
          setIsProfileModalOpen(true);
        }
      } else {
        setCurrentUser(null);
        setUserEmail('');
        setUserId('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Load live rides from Supabase
  const loadRides = useCallback(async () => {
    setLoadingRides(true);
    setErrorMsg(null);
    const { data, error } = await fetchLiveRides();
    if (error) setErrorMsg(error);
    setRides(data);
    setLoadingRides(false);
  }, []);

  useEffect(() => {
    loadRides();
  }, [loadRides]);

  // 3. Load requests for My Activity
  const loadRequests = useCallback(async () => {
    if (!currentUser) return;
    setLoadingRequests(true);
    const [incoming, outgoing] = await Promise.all([
      fetchIncomingRequests(currentUser.id),
      fetchOutgoingRequests(currentUser.id),
    ]);
    setRequests([...incoming, ...outgoing]);
    setLoadingRequests(false);
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'my-rides' && currentUser) {
      loadRequests();
    }
  }, [activeTab, currentUser, loadRequests]);

  // Save new user profile from modal
  const handleSaveProfile = async (profileData: UserProfile) => {
    const res = await saveUserProfile(profileData);
    if (res.success) {
      setCurrentUser(profileData);
      setIsProfileModalOpen(false);
    } else {
      alert('Failed to save profile: ' + res.error);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserEmail('');
    setUserId('');
  };

  // Create Ride (Live DB Insert)
  const handleCreateRide = async (newRideData: any) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const res = await createLiveRide({
      ...newRideData,
      host_id: currentUser.id,
    });

    if (res.success) {
      await loadRides();
      setActiveTab(newRideData.ride_category === 'exam' ? 'exam' : 'all');
    } else {
      alert('Could not publish ride: ' + res.error);
    }
  };

  // Request to Join (Live DB Insert)
  const handleSubmitRequest = async (
    rideId: string,
    seats: number,
    landmark: string,
    message: string
  ) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const res = await submitLiveRequest({
      rideId,
      passengerId: currentUser.id,
      seats,
      landmark,
      message,
    });

    if (res.success) {
      alert('Request sent to host successfully!');
      if (activeTab === 'my-rides') loadRequests();
    } else {
      alert('Failed to send request: ' + res.error);
    }
  };

  // Accept Request (Host Action)
  const handleAcceptRequest = async (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const res = await updateRequestStatus(
      requestId,
      req.ride_id,
      'accepted',
      req.seats_requested
    );

    if (res.success) {
      await Promise.all([loadRequests(), loadRides()]);
    } else {
      alert('Failed to accept request: ' + res.error);
    }
  };

  // Reject Request (Host Action)
  const handleRejectRequest = async (requestId: string) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const res = await updateRequestStatus(
      requestId,
      req.ride_id,
      'rejected',
      req.seats_requested
    );

    if (res.success) {
      loadRequests();
    } else {
      alert('Failed to reject request: ' + res.error);
    }
  };

  // Filter rides based on active tab and search
  const filteredRides = rides.filter((ride) => {
    if (activeTab === 'exam' && ride.ride_category !== 'exam') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesRoute =
        ride.origin.toLowerCase().includes(q) ||
        ride.destination.toLowerCase().includes(q) ||
        ride.vehicle_type?.toLowerCase().includes(q);
      if (!matchesRoute) return false;
    }

    if (selectedMode !== 'all' && ride.transport_mode !== selectedMode) return false;

    if (selectedGenderPref !== 'all' && ride.gender_preference !== selectedGenderPref)
      return false;

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
        onOpenCreateModal={() => {
          if (!currentUser) {
            router.push('/login');
          } else {
            setIsCreateModalOpen(true);
          }
        }}
        user={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Supabase Connection Notice if anon key not added */}
      {!isSupabaseConfigured && (
        <div className="bg-yellow/10 border-b border-yellow/30 px-4 py-2.5 text-xs text-yellow flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>
              <strong>Supabase Setup:</strong> Add your <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to connect your live database at <code>vltskirgkfvoulcwrvqa.supabase.co</code>.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'my-rides' ? (
          currentUser ? (
            <MyRidesView
              currentUser={currentUser}
              rides={rides}
              requests={requests}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <div className="card text-center py-16 max-w-md mx-auto">
              <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-3" />
              <h2 className="text-lg font-bold text-text mb-1">Sign in to View Activity</h2>
              <p className="text-xs text-muted mb-6">
                Sign in with your @srmist.edu.in account to manage rides and review passenger requests.
              </p>
              <Link href="/login" className="btn-primary text-xs py-2 px-6 mx-auto inline-flex">
                Sign In with SRM Mail
              </Link>
            </div>
          )
        ) : (
          <div>
            {/* Exam Banner if Exam Transit is active */}
            {activeTab === 'exam' && (
              <ExamTransitBanner
                selectedSession={selectedExamSession}
                setSelectedSession={setSelectedExamSession}
                venueSearch={venueSearch}
                setVenueSearch={setVenueSearch}
                onPostExamRide={() => {
                  if (!currentUser) router.push('/login');
                  else setIsCreateModalOpen(true);
                }}
              />
            )}

            {/* General Header & Hero */}
            {activeTab === 'all' && (
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-text tracking-tight flex items-center gap-2">
                    SRMIST Campus Commute Feed
                  </h1>
                  <p className="text-xs sm:text-sm text-muted">
                    Live rides across Potheri, Estancia, Abode, Tambaram, Airport, and Chennai city.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadRides}
                    className="p-2 rounded-xl bg-surface2/60 border border-border text-muted hover:text-text text-xs flex items-center gap-1.5 transition-colors"
                    title="Refresh live rides"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingRides ? 'animate-spin text-accent' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2/60 border border-border text-xs text-muted">
                    <ShieldCheck className="w-4 h-4 text-green" />
                    <span>Zero Public PII</span>
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

            {/* Error banner if query failed */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red/10 border border-red/30 text-red text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Database query error: {errorMsg}. (Check if Supabase migration is applied)</span>
              </div>
            )}

            {/* Ride Cards Grid */}
            {loadingRides ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="card animate-pulse h-48 bg-surface/50 border-border/50" />
                ))}
              </div>
            ) : filteredRides.length === 0 ? (
              <div className="card text-center py-16 border-dashed border-border/80">
                <Users className="w-10 h-10 text-muted mx-auto mb-3 opacity-40" />
                <h3 className="text-base font-semibold text-text mb-1">
                  No active rides in the database yet
                </h3>
                <p className="text-xs text-muted max-w-sm mx-auto mb-5">
                  Be the first SRM student to publish a ride listing!
                </p>
                <button
                  onClick={() => {
                    if (!currentUser) router.push('/login');
                    else setIsCreateModalOpen(true);
                  }}
                  className="btn-primary text-xs py-2 px-5 gap-1.5 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Post First Ride
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRides.map((ride) => {
                  const existingReq = requests.find(
                    (r) => r.ride_id === ride.id && r.passenger_id === currentUser?.id
                  );

                  return (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      currentUser={currentUser}
                      userRequestStatus={existingReq?.status}
                      unlockedContacts={unlockedContactsMap[ride.id] || []}
                      onRequestJoin={(targetRide) => {
                        if (!currentUser) router.push('/login');
                        else setSelectedRideForJoin(targetRide);
                      }}
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

      {/* Profile Onboarding Modal for New Students */}
      {userId && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          userEmail={userEmail}
          userId={userId}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* Post Ride Modal */}
      {currentUser && (
        <CreateRideModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          currentUser={currentUser}
          onCreateRide={handleCreateRide}
        />
      )}

      {/* Join Request Modal */}
      {currentUser && (
        <JoinRequestModal
          isOpen={Boolean(selectedRideForJoin)}
          onClose={() => setSelectedRideForJoin(null)}
          ride={selectedRideForJoin}
          currentUser={currentUser}
          onSubmitRequest={handleSubmitRequest}
        />
      )}
    </div>
  );
}
