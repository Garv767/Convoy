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
} from '../lib/api';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  Plus,
  Bus,
  TrainFront,
  CarTaxiFront,
  Bike,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'exam' | 'my-rides'>('exam');
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
  const [selectedMode, setSelectedMode] = useState<'all' | TransportMode>('all');
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
    if (currentUser) {
      loadRequests();
    }
  }, [currentUser, loadRequests]);

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
      if (typeof window !== 'undefined') {
        localStorage.setItem('convoy_pending_ride', JSON.stringify(newRideData));
      }
      router.push('/login');
      return;
    }

    const res = await createLiveRide({
      ...newRideData,
      host_id: currentUser.id,
    });

    if (res.success) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('convoy_pending_ride');
      }
      await loadRides();
      setActiveTab('exam');
    } else {
      alert('Could not publish ride: ' + res.error);
    }
  };

  // Auto-publish pending ride draft after login
  useEffect(() => {
    if (currentUser && typeof window !== 'undefined') {
      const pendingStr = localStorage.getItem('convoy_pending_ride');
      if (pendingStr) {
        try {
          const draft = JSON.parse(pendingStr);
          handleCreateRide(draft);
        } catch (e) {}
      }
    }
  }, [currentUser]);

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
      alert('Request sent to host!');
      if (currentUser) loadRequests();
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

  // Filter rides based on search, shift, and mode
  const filteredRides = rides.filter((ride) => {
    // Venue or pickup search
    if (venueSearch.trim()) {
      const v = venueSearch.toLowerCase();
      const matchesCenter =
        ride.destination.toLowerCase().includes(v) ||
        ride.origin.toLowerCase().includes(v) ||
        ride.exam_venue?.toLowerCase().includes(v);
      if (!matchesCenter) return false;
    }

    // Shift filter (FN / AN)
    if (selectedExamSession !== 'all' && ride.exam_session !== selectedExamSession) {
      return false;
    }

    // Mode filter
    if (selectedMode !== 'all' && ride.transport_mode !== selectedMode) {
      return false;
    }

    return true;
  });

  const pendingIncomingCount = requests.filter(
    (req) => req.status === 'pending' && rides.some((r) => r.id === req.ride_id && r.host_id === currentUser?.id)
  ).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onEditProfile={() => setIsProfileModalOpen(true)}
        user={currentUser}
        onSignOut={handleSignOut}
        pendingCount={pendingIncomingCount}
      />

      {/* Supabase Connection Notice if anon key not added */}
      {!isSupabaseConfigured && (
        <div className="bg-yellow/10 border-b border-yellow/20 px-4 py-2 text-xs text-yellow">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>
              Add <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env.local</code> to connect live data.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {activeTab === 'my-rides' ? (
          currentUser ? (
            <MyRidesView
              currentUser={currentUser}
              rides={rides}
              requests={requests}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onEditProfile={() => setIsProfileModalOpen(true)}
            />
          ) : (
            <div className="card text-center py-12 max-w-sm mx-auto my-8">
              <div className="w-10 h-10 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5 text-green" />
              </div>
              <h2 className="text-base font-bold text-text mb-1">Sign in to View Activity</h2>
              <p className="text-xs text-muted mb-5">
                Use your @srmist.edu.in account to view requests and host activity.
              </p>
              <Link href="/login" className="btn-primary text-xs py-2 px-5 mx-auto inline-flex">
                Sign In
              </Link>
            </div>
          )
        ) : (
          <div>
            {/* NPTEL Exam Transit Banner & Shift / Center Filter */}
            <ExamTransitBanner
              selectedSession={selectedExamSession}
              setSelectedSession={setSelectedExamSession}
              venueSearch={venueSearch}
              setVenueSearch={setVenueSearch}
              onPostExamRide={() => setIsCreateModalOpen(true)}
            />

            {/* Mode of Transport Carousel & Ride Count */}
            <div className="mb-4 sm:mb-5 flex items-center justify-between gap-2">
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1 w-full">
                <button
                  onClick={() => setSelectedMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    selectedMode === 'all'
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-surface2 text-muted hover:text-text border border-border'
                  }`}
                >
                  All Modes
                </button>
                <button
                  onClick={() => setSelectedMode('cab')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    selectedMode === 'cab'
                      ? 'bg-yellow/20 text-yellow border border-yellow/40 shadow-sm'
                      : 'bg-surface2 text-muted hover:text-text border border-border'
                  }`}
                >
                  <CarTaxiFront className="w-3.5 h-3.5" />
                  <span>Auto / Cab</span>
                </button>
                <button
                  onClick={() => setSelectedMode('bus')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    selectedMode === 'bus'
                      ? 'bg-accent/20 text-accent border border-accent/40 shadow-sm'
                      : 'bg-surface2 text-muted hover:text-text border border-border'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>Bus</span>
                </button>
                <button
                  onClick={() => setSelectedMode('train')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    selectedMode === 'train'
                      ? 'bg-accent2/20 text-accent2 border border-accent2/40 shadow-sm'
                      : 'bg-surface2 text-muted hover:text-text border border-border'
                  }`}
                >
                  <TrainFront className="w-3.5 h-3.5" />
                  <span>Train</span>
                </button>
                <button
                  onClick={() => setSelectedMode('private_vehicle')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    selectedMode === 'private_vehicle'
                      ? 'bg-green/20 text-green border border-green/40 shadow-sm'
                      : 'bg-surface2 text-muted hover:text-text border border-border'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Two-Wheeler</span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={loadRides}
                  className="p-1.5 rounded-lg bg-surface2 border border-border text-muted hover:text-text text-xs flex items-center gap-1"
                  title="Refresh rides"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRides ? 'animate-spin text-accent' : ''}`} />
                </button>
                <span className="hidden sm:inline text-xs text-muted font-medium whitespace-nowrap">
                  {filteredRides.length} {filteredRides.length === 1 ? 'ride' : 'rides'}
                </span>
              </div>
            </div>

            {/* Error banner if query failed */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red/10 border border-red/20 text-red text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Ride Cards Grid */}
            {loadingRides ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="card animate-pulse h-44 bg-surface/50 border-border/50" />
                ))}
              </div>
            ) : filteredRides.length === 0 ? (
              <div className="card text-center py-12 border-dashed border-border my-4">
                <p className="text-sm font-semibold text-text mb-1">
                  No rides posted yet for this center or shift
                </p>
                <p className="text-xs text-muted mb-4">
                  Heading to an exam center? Post your ride and pool with peers!
                </p>
                <button
                  onClick={() => {
                    if (!currentUser) router.push('/login');
                    else setIsCreateModalOpen(true);
                  }}
                  className="btn-primary text-xs py-2 px-4 gap-1.5 mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Post Ride
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
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
      <footer className="hidden md:block mt-auto border-t border-border py-4 text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span className="font-semibold text-text">Convoy</span>
        </div>
      </footer>

      {/* Profile Setup / Edit Modal */}
      {(userId || currentUser) && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          userEmail={userEmail || (currentUser ? `${currentUser.user_net_id}@srmist.edu.in` : '')}
          userId={userId || currentUser?.id || ''}
          initialProfile={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onSaveProfile={handleSaveProfile}
        />
      )}

      {/* Post NPTEL Ride Modal */}
      <CreateRideModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onCreateRide={handleCreateRide}
      />

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
