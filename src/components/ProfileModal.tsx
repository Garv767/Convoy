import React, { useState } from 'react';
import { ShieldCheck, User, Phone, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { UserProfile, UserGender } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  userEmail: string;
  userId: string;
  onSaveProfile: (profile: UserProfile) => void;
}

export default function ProfileModal({
  isOpen,
  userEmail,
  userId,
  onSaveProfile,
}: ProfileModalProps) {
  const netId = userEmail.split('@')[0] || '';
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [gender, setGender] = useState<UserGender>('male');
  const [department, setDepartment] = useState('B.Tech Computer Science & Engg');
  const [yearOfStudy, setYearOfStudy] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) return;

    setIsSubmitting(true);
    onSaveProfile({
      id: userId,
      user_net_id: netId,
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      whatsapp_number: whatsappNumber.trim() || phoneNumber.trim(),
      gender,
      department: department.trim(),
      year_of_study: Number(yearOfStudy),
      is_verified: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="card w-full max-w-md bg-surface border-border shadow-2xl p-6">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 mx-auto flex items-center justify-center text-accent mb-2">
            <ShieldCheck className="w-6 h-6 text-green" />
          </div>
          <h2 className="text-xl font-bold text-text">Complete Your Convoy Profile</h2>
          <p className="text-xs text-muted">
            Verified as <strong className="text-accent font-mono">{userEmail}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              required
              className="input-field w-full text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                required
                className="input-field w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">WhatsApp (Optional)</label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Same as phone"
                className="input-field w-full text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Your Gender</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  gender === 'male'
                    ? 'border-accent bg-accent/20 text-accent font-bold'
                    : 'border-border bg-surface2/60 text-muted'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  gender === 'female'
                    ? 'border-accent2 bg-accent2/20 text-accent2 font-bold'
                    : 'border-border bg-surface2/60 text-muted'
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setGender('other')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  gender === 'other'
                    ? 'border-green bg-green/20 text-green font-bold'
                    : 'border-border bg-surface2/60 text-muted'
                }`}
              >
                Other
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Department / Branch</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. B.Tech CSE Core, Mechanical, Biotechnology..."
              required
              className="input-field w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Year of Study</label>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(Number(e.target.value))}
              className="input-field w-full text-xs"
            >
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
              <option value={4}>4th Year</option>
              <option value={5}>Postgraduate / Ph.D.</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-surface2/60 border border-border text-[11px] text-muted">
            Your contact details are strictly kept private and only shared when you accept a ride match.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? 'Saving Profile...' : 'Save & Continue to Convoy'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
