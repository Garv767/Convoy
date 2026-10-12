import React, { useState } from 'react';
import {
  X,
  Bus,
  TrainFront,
  CarTaxiFront,
  Car,
  Bike,
  GraduationCap,
  Clock,
  Sparkles,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { TransportMode, GenderPreference, FareType, ExamSession, RideListing, UserProfile } from '../types';

interface CreateRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onCreateRide: (newRide: Omit<RideListing, 'id' | 'created_at' | 'status'>) => void;
}

const COMMON_SRM_SPOTS = [
  'SRM Gate 1',
  'Potheri EMU Station',
  'Arch Gate',
  'Estancia Main Gate',
  'Abode Valley Entrance',
  'Green Pearl Gate',
  'Tambaram Station',
  'Chennai Airport (MAA)',
];

export default function CreateRideModal({
  isOpen,
  onClose,
  currentUser,
  onCreateRide,
}: CreateRideModalProps) {
  const [category, setCategory] = useState<'general' | 'exam'>('general');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('2026-10-12');

  React.useEffect(() => {
    setDepartureDate(new Date().toISOString().split('T')[0]);
  }, []);
  const [departureTime, setDepartureTime] = useState('08:30');
  const [transportMode, setTransportMode] = useState<TransportMode>('cab');
  const [vehicleType, setVehicleType] = useState('Uber Auto (3 seats)');
  const [totalSeats, setTotalSeats] = useState(3);
  const [fareType, setFareType] = useState<FareType>('split');
  const [estimatedCost, setEstimatedCost] = useState('40');
  const [genderPref, setGenderPref] = useState<GenderPreference>('any');
  const [notes, setNotes] = useState('');

  // Exam fields (Venue is a flexible text field!)
  const [examSession, setExamSession] = useState<ExamSession>('FN');
  const [examVenue, setExamVenue] = useState('Tech Park 8th Floor');
  const [examCourseCode, setExamCourseCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    onCreateRide({
      host_id: currentUser.id,
      ride_category: category,
      origin: origin.trim(),
      destination: destination.trim(),
      departure_date: departureDate,
      departure_time: departureTime,
      transport_mode: transportMode,
      vehicle_type: vehicleType.trim() || undefined,
      total_seats: Number(totalSeats),
      available_seats: Number(totalSeats),
      fare_type: fareType,
      estimated_cost_inr: estimatedCost ? Number(estimatedCost) : undefined,
      gender_preference: genderPref,
      notes: notes.trim() || undefined,
      host_gender: currentUser.gender,
      host_department: currentUser.department,
      host_year: currentUser.year_of_study,
      host_is_verified: currentUser.is_verified,
      ...(category === 'exam'
        ? {
            exam_session: examSession,
            exam_venue: examVenue.trim(),
            exam_course_code: examCourseCode.trim() || undefined,
          }
        : {}),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="card w-full max-w-xl bg-surface border-border my-8 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5 sticky top-0 bg-surface z-10">
          <div>
            <h2 className="text-xl font-bold text-text">Post a Convoy Ride</h2>
            <p className="text-xs text-muted">
              Connect with fellow SRMites heading the same direction
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Toggle */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Ride Category
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface2/60 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setCategory('general')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  category === 'general'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted hover:text-text'
                }`}
              >
                General Campus / Travel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory('exam');
                  if (!destination) setDestination('SRM Tech Park');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  category === 'exam'
                    ? 'bg-accent2 text-white shadow-sm'
                    : 'text-muted hover:text-text'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Exam Transit Hub
              </button>
            </div>
          </div>

          {/* Exam Details Section (When Exam Category is Selected) */}
          {category === 'exam' && (
            <div className="p-4 rounded-xl bg-accent2/10 border border-accent2/30 space-y-3">
              <div className="flex items-center gap-2 text-accent2 text-xs font-bold">
                <GraduationCap className="w-4 h-4" />
                <span>Exam Transit Details</span>
              </div>

              {/* Session Selection */}
              <div>
                <label className="block text-xs text-text mb-1.5">Exam Session</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExamSession('FN')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                      examSession === 'FN'
                        ? 'border-accent2 bg-accent2/20 text-white'
                        : 'border-border bg-surface2/60 text-muted hover:text-text'
                    }`}
                  >
                    <p className="font-bold">Forenoon (FN)</p>
                    <p className="text-[10px] text-muted">9:00 AM - 12:00 PM</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExamSession('AN')}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition-all ${
                      examSession === 'AN'
                        ? 'border-accent2 bg-accent2/20 text-white'
                        : 'border-border bg-surface2/60 text-muted hover:text-text'
                    }`}
                  >
                    <p className="font-bold">Afternoon (AN)</p>
                    <p className="text-[10px] text-muted">1:30 PM - 4:30 PM</p>
                  </button>
                </div>
              </div>

              {/* Exam Venue: Flexible Text Field */}
              <div>
                <label className="block text-xs text-text mb-1">
                  Venue / Classroom (Flexible Text)
                </label>
                <input
                  type="text"
                  value={examVenue}
                  onChange={(e) => setExamVenue(e.target.value)}
                  placeholder="e.g. Tech Park 8th Floor, UB 602, Bio-Tech Lab 3..."
                  required={category === 'exam'}
                  className="input-field w-full text-xs"
                />
                <p className="text-[11px] text-muted mt-1">
                  Specify any block, floor, or hall number.
                </p>
              </div>

              {/* Course Code (Optional) */}
              <div>
                <label className="block text-xs text-text mb-1">
                  Course / Subject Code <span className="text-muted">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={examCourseCode}
                  onChange={(e) => setExamCourseCode(e.target.value)}
                  placeholder="e.g. 21CSC302J"
                  className="input-field w-full text-xs uppercase"
                />
              </div>
            </div>
          )}

          {/* Transport Mode (Strictly SVG, Zero Emojis) */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Mode of Transportation (SVG Vector)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setTransportMode('cab');
                  setVehicleType('Uber Auto / Rapido');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs gap-1.5 transition-all ${
                  transportMode === 'cab'
                    ? 'border-yellow bg-yellow/15 text-yellow font-bold shadow-sm'
                    : 'border-border bg-surface2/40 text-muted hover:text-text'
                }`}
              >
                <CarTaxiFront className="w-5 h-5" />
                <span>Cab / Auto</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransportMode('bus');
                  setVehicleType('MTC Bus 500 / 118');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs gap-1.5 transition-all ${
                  transportMode === 'bus'
                    ? 'border-accent bg-accent/15 text-accent font-bold shadow-sm'
                    : 'border-border bg-surface2/40 text-muted hover:text-text'
                }`}
              >
                <Bus className="w-5 h-5" />
                <span>Bus / Shuttle</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransportMode('train');
                  setVehicleType('Potheri Local EMU');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs gap-1.5 transition-all ${
                  transportMode === 'train'
                    ? 'border-accent2 bg-accent2/15 text-accent2 font-bold shadow-sm'
                    : 'border-border bg-surface2/40 text-muted hover:text-text'
                }`}
              >
                <TrainFront className="w-5 h-5" />
                <span>Train / Metro</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTransportMode('private_vehicle');
                  setVehicleType('Two-Wheeler / Bike');
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs gap-1.5 transition-all ${
                  transportMode === 'private_vehicle'
                    ? 'border-green bg-green/15 text-green font-bold shadow-sm'
                    : 'border-border bg-surface2/40 text-muted hover:text-text'
                }`}
              >
                <Bike className="w-5 h-5" />
                <span>Private Vehicle</span>
              </button>
            </div>
          </div>

          {/* Vehicle Detail Description */}
          <div>
            <label className="block text-xs text-text mb-1">Vehicle Description</label>
            <input
              type="text"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              placeholder="e.g. Uber Auto (3 seats), Honda Activa, Swift Car..."
              className="input-field w-full text-xs"
            />
          </div>

          {/* Route: Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text mb-1">Starting Point (Origin)</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Estancia Gate 2"
                required
                className="input-field w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-text mb-1">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. SRM Tech Park"
                required
                className="input-field w-full text-xs"
              />
            </div>
          </div>

          {/* Quick Spots chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-muted mr-1">Quick picks:</span>
            {COMMON_SRM_SPOTS.slice(0, 5).map((spot) => (
              <button
                key={spot}
                type="button"
                onClick={() => (!origin ? setOrigin(spot) : setDestination(spot))}
                className="px-2 py-0.5 rounded bg-surface2 hover:bg-border text-muted hover:text-text border border-border/60 transition-colors"
              >
                {spot}
              </button>
            ))}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text mb-1">Departure Date</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                required
                className="input-field w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-text mb-1">Departure Time</label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
                className="input-field w-full text-xs"
              />
            </div>
          </div>

          {/* Seats & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-text mb-1">Total Available Seats</label>
              <input
                type="number"
                min="1"
                max="6"
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                required
                className="input-field w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-text mb-1">Fare Type</label>
              <select
                value={fareType}
                onChange={(e) => setFareType(e.target.value as FareType)}
                className="input-field w-full text-xs"
              >
                <option value="split">Split Equally</option>
                <option value="fixed">Fixed Cost</option>
                <option value="free">Free Ride</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text mb-1">Est. Cost per person (₹)</label>
              <input
                type="number"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                disabled={fareType === 'free'}
                className="input-field w-full text-xs disabled:opacity-50"
              />
            </div>
          </div>

          {/* Gender Preference */}
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Co-Passenger Gender Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGenderPref('any')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  genderPref === 'any'
                    ? 'border-accent bg-accent/20 text-accent font-bold'
                    : 'border-border bg-surface2/60 text-muted hover:text-text'
                }`}
              >
                Open to All
              </button>
              <button
                type="button"
                onClick={() => setGenderPref('female_only')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  genderPref === 'female_only'
                    ? 'border-accent2 bg-accent2/20 text-accent2 font-bold'
                    : 'border-border bg-surface2/60 text-muted hover:text-text'
                }`}
              >
                Women Only
              </button>
              <button
                type="button"
                onClick={() => setGenderPref('male_only')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  genderPref === 'male_only'
                    ? 'border-accent bg-accent/20 text-accent font-bold'
                    : 'border-border bg-surface2/60 text-muted hover:text-text'
                }`}
              >
                Men Only
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs text-text mb-1">Notes / Exact Landmark</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Waiting right in front of the tea stall. Carrying 1 backpack."
              className="input-field w-full text-xs resize-none"
            />
          </div>

          {/* Privacy Guarantee Notice */}
          <div className="p-3 rounded-xl bg-surface2/60 border border-border flex items-start gap-2.5 text-xs text-muted">
            <ShieldAlert className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <p>
              <strong>Privacy Protection:</strong> Your phone number and WhatsApp will <strong>never</strong> be shown publicly. Contact info is only revealed to passengers you explicitly accept.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-6"
            >
              Publish Ride
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
