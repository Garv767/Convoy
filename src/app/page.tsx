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
  updateLiveRide,
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
  Compass,
  Sparkles,
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
  const [editingRide, setEditingRide] = useState<RideListing | null>(null);
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

  // Update Ride (Live DB Update)
  const handleUpdateRide = async (rideId: string, updatedRideData: any) => {
    const res = await updateLiveRide(rideId, updatedRideData);
    if (res.success) {
      await loadRides();
      setEditingRide(null);
      setIsCreateModalOpen(false);
    } else {
      alert('Could not update ride: ' + res.error);
    }
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div
        className="fixed top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-[#1E88E5]/10 blur-[140px] rounded-full pointer-events-none animate-pulse"
        style={{ animationDuration: '9s' }}
      />
      <div
        className="fixed top-[30%] right-[-10%] w-[40vw] h-[40vw] bg-[#8b5cf6]/10 blur-[150px] rounded-full pointer-events-none animate-pulse"
        style={{ animationDuration: '11s', animationDelay: '2s' }}
      />
      <div
        className="fixed bottom-[-10%] left-[20%] w-[40vw] h-[30vw] bg-[#10b981]/5 blur-[160px] rounded-full pointer-events-none"
      />

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
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>
              Add <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env.local</code> to connect live data.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 md:pb-10 relative z-10">
        {activeTab === 'my-rides' ? (
          currentUser ? (
            <MyRidesView
              currentUser={currentUser}
              rides={rides}
              requests={requests}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              onOpenCreateModal={() => {
                setEditingRide(null);
                setIsCreateModalOpen(true);
              }}
              onEditProfile={() => setIsProfileModalOpen(true)}
              onEditRide={(ride) => {
                setEditingRide(ride);
                setIsCreateModalOpen(true);
              }}
            />
          ) : (
            <div className="rounded-3xl bg-[#121522]/90 backdrop-blur-xl border border-white/[0.08] text-center py-14 px-6 max-w-md mx-auto my-10 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E88E5]/20 to-[#8b5cf6]/20 border border-[#1E88E5]/30 text-[#1E88E5] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(30,136,229,0.2)]">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Student Activity Hub</h2>
              <p className="text-xs text-gray-400 leading-relaxed mb-6 max-w-xs mx-auto">
                Sign in with your verified <span className="text-[#60a5fa] font-mono">@srmist.edu.in</span> account to manage incoming passenger requests and coordinate rides.
              </p>
              <Link href="/login" className="btn-primary text-xs py-2.5 px-6 mx-auto inline-flex shadow-lg">
                Sign In with SRM Mail
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

            {/* Mode of Transport Pills & Live Count */}
            <div className="mb-5 sm:mb-6 flex items-center justify-between gap-3">
              <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1 w-full">
                <button
                  onClick={() => setSelectedMode('all')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                    selectedMode === 'all'
                      ? 'bg-gradient-to-r from-[#1E88E5] to-[#3b82f6] text-white shadow-[0_0_20px_rgba(30,136,229,0.35)]'
                      : 'bg-[#121522]/90 backdrop-blur-md text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 hover:bg-[#1a1e2d]'
                  }`}
                >
                  All Modes
                </button>
                <button
                  onClick={() => setSelectedMode('cab')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                    selectedMode === 'cab'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                      : 'bg-[#121522]/90 backdrop-blur-md text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 hover:bg-[#1a1e2d]'
                  }`}
                >
                  <CarTaxiFront className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto / Cab</span>
                </button>
                <button
                  onClick={() => setSelectedMode('bus')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                    selectedMode === 'bus'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                      : 'bg-[#121522]/90 backdrop-blur-md text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 hover:bg-[#1a1e2d]'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bus</span>
                </button>
                <button
                  onClick={() => setSelectedMode('train')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                    selectedMode === 'train'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                      : 'bg-[#121522]/90 backdrop-blur-md text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 hover:bg-[#1a1e2d]'
                  }`}
                >
                  <TrainFront className="w-3.5 h-3.5 text-purple-400" />
                  <span>Train</span>
                </button>
                <button
                  onClick={() => setSelectedMode('private_vehicle')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                    selectedMode === 'private_vehicle'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                      : 'bg-[#121522]/90 backdrop-blur-md text-gray-400 hover:text-white border border-white/[0.08] hover:border-white/20 hover:bg-[#1a1e2d]'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Two-Wheeler</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={loadRides}
                  className="p-2 rounded-full bg-[#121522]/90 border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/25 text-xs flex items-center justify-center transition-all cursor-pointer"
                  title="Refresh rides"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRides ? 'animate-spin text-[#1E88E5]' : ''}`} />
                </button>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121522]/90 border border-white/[0.08] text-xs font-medium text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{filteredRides.length} {filteredRides.length === 1 ? 'ride' : 'rides'}</span>
                </div>
              </div>
            </div>

            {/* Error banner if query failed */}
            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Ride Cards Grid */}
            {loadingRides ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="rounded-2xl bg-[#121522]/80 border border-white/[0.06] p-5 h-64 animate-pulse flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="w-24 h-6 rounded-full bg-white/[0.06]" />
                        <div className="w-20 h-6 rounded-full bg-white/[0.06]" />
                      </div>
                      <div className="space-y-3 pt-2">
                        <div className="w-3/4 h-4 rounded bg-white/[0.06]" />
                        <div className="w-1/2 h-4 rounded bg-white/[0.06]" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-full h-8 rounded-xl bg-white/[0.04]" />
                      <div className="w-full h-9 rounded-full bg-white/[0.06]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRides.length === 0 ? (
              <div className="rounded-3xl bg-[#121522]/70 backdrop-blur-xl border border-dashed border-white/[0.12] text-center py-16 px-6 my-6 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-[#1E88E5]/10 border border-[#1E88E5]/20 text-[#60a5fa] flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">
                  No active rides found for this route or shift
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6 leading-relaxed">
                  Heading to an exam center or traveling back from campus? Form your convoy and split the commute with classmates.
                </p>
                <button
                  onClick={() => {
                    if (!currentUser) router.push('/login');
                    else {
                      setEditingRide(null);
                      setIsCreateModalOpen(true);
                    }
                  }}
                  className="btn-primary text-xs py-2.5 px-6 gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post the First Ride</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                      onEditRide={(targetRide) => {
                        setEditingRide(targetRide);
                        setIsCreateModalOpen(true);
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
      <footer className="hidden md:block mt-auto border-t border-white/[0.06] py-5 text-xs text-gray-500 relative z-10 bg-[#090b11]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-300">Convoy</span>
            <span className="text-gray-600">·</span>
            <span>Privacy-First SRM Transit Coordination</span>
          </div>
          <span className="font-mono text-[11px] text-gray-600">
            convoy.unfugly.app
          </span>
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

      {/* Post / Edit Ride Modal */}
      <CreateRideModal
        isOpen={isCreateModalOpen}
        initialRide={editingRide}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingRide(null);
        }}
        currentUser={currentUser}
        onCreateRide={handleCreateRide}
        onUpdateRide={handleUpdateRide}
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
