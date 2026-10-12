export type TransportMode = 'bus' | 'train' | 'cab' | 'private_vehicle';
export type GenderPreference = 'any' | 'female_only' | 'male_only';
export type UserGender = 'female' | 'male' | 'other';
export type FareType = 'split' | 'fixed' | 'free';
export type ExamSession = 'FN' | 'AN';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface UserProfile {
  id: string;
  user_net_id: string;
  full_name: string;
  phone_number: string;
  whatsapp_number?: string;
  gender: UserGender;
  department: string;
  year_of_study: number;
  is_verified: boolean;
  created_at?: string;
}

export interface RideListing {
  id: string;
  host_id: string;
  ride_category: 'general' | 'exam';
  origin: string;
  destination: string;
  departure_date: string;
  departure_time: string;
  transport_mode: TransportMode;
  vehicle_type?: string;
  total_seats: number;
  available_seats: number;
  fare_type: FareType;
  estimated_cost_inr?: number;
  gender_preference: GenderPreference;
  notes?: string;
  status: 'active' | 'full' | 'completed' | 'cancelled';
  created_at: string;
  host_gender: UserGender;
  host_department: string;
  host_year: number;
  host_is_verified: boolean;
  exam_session?: ExamSession;
  exam_venue?: string;
  exam_course_code?: string;
}

export interface RideRequest {
  id: string;
  ride_id: string;
  passenger_id: string;
  passenger_net_id?: string;
  passenger_name: string;
  passenger_gender: UserGender;
  passenger_department?: string;
  passenger_phone?: string;
  passenger_whatsapp?: string;
  seats_requested: number;
  pickup_landmark?: string;
  message?: string;
  status: RequestStatus;
  created_at: string;
  ride_origin?: string;
  ride_destination?: string;
  ride_departure_time?: string;
  ride_departure_date?: string;
}

export interface UnlockedContact {
  user_id: string;
  full_name: string;
  phone_number: string;
  whatsapp_number?: string;
  role: 'host' | 'passenger';
}

export interface NewRideInput {
  host_id: string;
  ride_category: 'general' | 'exam';
  origin: string;
  destination: string;
  departure_date: string;
  departure_time: string;
  transport_mode: TransportMode;
  vehicle_type?: string;
  total_seats: number;
  available_seats: number;
  fare_type: FareType;
  estimated_cost_inr?: number;
  gender_preference: GenderPreference;
  notes?: string;
  exam_session?: ExamSession;
  exam_venue?: string;
  exam_course_code?: string;
}
