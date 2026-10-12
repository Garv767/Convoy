import { supabase } from './supabaseClient';
import {
  RideListing,
  RideRequest,
  UserProfile,
  UnlockedContact,
  NewRideInput,
} from '../types';

/**
 * Fetch all active rides from the sanitized public view.
 * Zero PII is exposed.
 */
export async function fetchLiveRides(): Promise<{ data: RideListing[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('commute_public_rides')
      .select('*')
      .order('departure_date', { ascending: true })
      .order('departure_time', { ascending: true });

    if (error) {
      console.error('Error fetching live rides:', error.message);
      return { data: [], error: error.message };
    }

    return { data: (data as RideListing[]) || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || 'Network error fetching rides' };
  }
}

/**
 * Fetch user profile by Auth UUID.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('commute_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data as UserProfile | null;
  } catch {
    return null;
  }
}

/**
 * Create or update student profile in commute_profiles.
 */
export async function saveUserProfile(profile: UserProfile): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('commute_profiles')
      .upsert({
        id: profile.id,
        user_net_id: profile.user_net_id,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        whatsapp_number: profile.whatsapp_number || profile.phone_number,
        gender: profile.gender,
        department: profile.department,
        year_of_study: profile.year_of_study,
        is_verified: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Insert a new ride into commute_rides and commute_exam_details.
 */
export async function createLiveRide(
  ride: NewRideInput
): Promise<{ success: boolean; rideId?: string; error: string | null }> {
  try {
    const { data: rideData, error: rideError } = await supabase
      .from('commute_rides')
      .insert({
        host_id: ride.host_id,
        ride_category: ride.ride_category,
        origin: ride.origin,
        destination: ride.destination,
        departure_date: ride.departure_date,
        departure_time: ride.departure_time,
        transport_mode: ride.transport_mode,
        vehicle_type: ride.vehicle_type || null,
        total_seats: ride.total_seats,
        available_seats: ride.available_seats,
        fare_type: ride.fare_type,
        estimated_cost_inr: ride.estimated_cost_inr || null,
        gender_preference: ride.gender_preference,
        notes: ride.notes || null,
        status: 'active',
      })
      .select('id')
      .single();

    if (rideError) return { success: false, error: rideError.message };

    const newRideId = rideData.id;

    // If it is an exam ride, insert exam details
    if (ride.ride_category === 'exam' && ride.exam_session && ride.exam_venue) {
      const { error: examError } = await supabase
        .from('commute_exam_details')
        .insert({
          ride_id: newRideId,
          session: ride.exam_session,
          venue: ride.exam_venue,
          course_code: ride.exam_course_code || null,
        });

      if (examError) console.error('Error inserting exam details:', examError.message);
    }

    return { success: true, rideId: newRideId, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Submit join request to commute_requests.
 */
export async function submitLiveRequest(input: {
  rideId: string;
  passengerId: string;
  seats: number;
  landmark: string;
  message: string;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.from('commute_requests').insert({
      ride_id: input.rideId,
      passenger_id: input.passengerId,
      seats_requested: input.seats,
      pickup_landmark: input.landmark || null,
      message: input.message || null,
      status: 'pending',
    });

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch incoming requests for rides hosted by hostId.
 */
export async function fetchIncomingRequests(hostId: string): Promise<RideRequest[]> {
  try {
    // 1. Get host ride IDs
    const { data: hostRides, error: ridesErr } = await supabase
      .from('commute_rides')
      .select('id, origin, destination, departure_time, departure_date')
      .eq('host_id', hostId);

    if (ridesErr || !hostRides || hostRides.length === 0) return [];

    const rideIds = hostRides.map((r) => r.id);
    const rideMap = new Map(hostRides.map((r) => [r.id, r]));

    // 2. Fetch requests for these rides
    const { data: reqs, error: reqsErr } = await supabase
      .from('commute_requests')
      .select('*')
      .in('ride_id', rideIds)
      .order('created_at', { ascending: false });

    if (reqsErr || !reqs) return [];

    // 3. Fetch profiles of passengers
    const passengerIds = Array.from(new Set(reqs.map((r) => r.passenger_id)));
    const { data: profiles } = await supabase
      .from('commute_profiles')
      .select('*')
      .in('id', passengerIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    return reqs.map((r) => {
      const p = profileMap.get(r.passenger_id);
      const ride = rideMap.get(r.ride_id);
      return {
        id: r.id,
        ride_id: r.ride_id,
        passenger_id: r.passenger_id,
        passenger_net_id: p?.user_net_id || 'student',
        passenger_name: p?.full_name || 'SRM Student',
        passenger_gender: p?.gender || 'other',
        passenger_department: p?.department || 'SRMIST',
        passenger_phone: p?.phone_number,
        passenger_whatsapp: p?.whatsapp_number,
        seats_requested: r.seats_requested,
        pickup_landmark: r.pickup_landmark,
        message: r.message,
        status: r.status,
        created_at: r.created_at,
        ride_origin: ride?.origin,
        ride_destination: ride?.destination,
        ride_departure_time: ride?.departure_time,
        ride_departure_date: ride?.departure_date,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Fetch outgoing requests sent by passengerId.
 */
export async function fetchOutgoingRequests(passengerId: string): Promise<RideRequest[]> {
  try {
    const { data: reqs, error } = await supabase
      .from('commute_requests')
      .select('*')
      .eq('passenger_id', passengerId)
      .order('created_at', { ascending: false });

    if (error || !reqs) return [];

    const rideIds = Array.from(new Set(reqs.map((r) => r.ride_id)));
    const { data: rides } = await supabase
      .from('commute_rides')
      .select('id, origin, destination, departure_time, departure_date')
      .in('id', rideIds);

    const rideMap = new Map(rides?.map((r) => [r.id, r]) || []);

    return reqs.map((r) => {
      const ride = rideMap.get(r.ride_id);
      return {
        id: r.id,
        ride_id: r.ride_id,
        passenger_id: r.passenger_id,
        passenger_name: 'You',
        passenger_gender: 'other',
        seats_requested: r.seats_requested,
        pickup_landmark: r.pickup_landmark,
        message: r.message,
        status: r.status,
        created_at: r.created_at,
        ride_origin: ride?.origin,
        ride_destination: ride?.destination,
        ride_departure_time: ride?.departure_time,
        ride_departure_date: ride?.departure_date,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Update request status (Accept / Reject) and decrement seats on accept.
 */
export async function updateRequestStatus(
  requestId: string,
  rideId: string,
  status: 'accepted' | 'rejected',
  seatsRequested: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error: reqError } = await supabase
      .from('commute_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (reqError) return { success: false, error: reqError.message };

    if (status === 'accepted') {
      // Decrement available seats
      const { data: ride } = await supabase
        .from('commute_rides')
        .select('available_seats')
        .eq('id', rideId)
        .single();

      if (ride) {
        const newSeats = Math.max(0, ride.available_seats - seatsRequested);
        await supabase
          .from('commute_rides')
          .update({
            available_seats: newSeats,
            status: newSeats === 0 ? 'full' : 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', rideId);
      }
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Unlocks contacts bilaterally via Supabase RPC.
 */
export async function fetchRideContacts(rideId: string): Promise<UnlockedContact[]> {
  try {
    const { data, error } = await supabase.rpc('get_ride_contacts', {
      target_ride_id: rideId,
    });

    if (error || !data) return [];
    return data as UnlockedContact[];
  } catch {
    return [];
  }
}
