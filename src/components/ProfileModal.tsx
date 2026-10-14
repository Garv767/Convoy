import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, X, User } from 'lucide-react';
import { UserProfile, UserGender } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  userEmail: string;
  userId: string;
  initialProfile?: UserProfile | null;
  onClose?: () => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export default function ProfileModal({
  isOpen,
  userEmail,
  userId,
  initialProfile,
  onClose,
  onSaveProfile,
}: ProfileModalProps) {
  const isEditing = Boolean(initialProfile && initialProfile.full_name);
  const netId = initialProfile?.user_net_id || userEmail.split('@')[0] || '';

  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(initialProfile?.phone_number || '');
  const [whatsappNumber, setWhatsappNumber] = useState(initialProfile?.whatsapp_number || '');
  const [gender, setGender] = useState<UserGender>(initialProfile?.gender || 'male');
  const [department, setDepartment] = useState(initialProfile?.department || 'B.Tech CSE');
  const [yearOfStudy, setYearOfStudy] = useState(initialProfile?.year_of_study || 3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setFullName(initialProfile.full_name || '');
      setPhoneNumber(initialProfile.phone_number || '');
      setWhatsappNumber(initialProfile.whatsapp_number || '');
      setGender(initialProfile.gender || 'male');
      setDepartment(initialProfile.department || 'B.Tech CSE');
      setYearOfStudy(initialProfile.year_of_study || 3);
    }
  }, [initialProfile]);

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
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-surface border-t sm:border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 mx-auto flex items-center justify-center text-accent mb-2">
            <ShieldCheck className="w-5 h-5 text-green" />
          </div>
          <h2 className="text-lg font-bold text-text">
            {isEditing ? 'Edit Profile' : 'Profile Setup'}
          </h2>
          <p className="text-xs text-muted">
            Signed in as <span className="font-mono text-accent">{userEmail}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
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
              <label className="block text-xs font-semibold text-text mb-1">WhatsApp</label>
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
            <label className="block text-xs font-semibold text-text mb-1">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  gender === 'male'
                    ? 'border-accent bg-accent/20 text-accent font-bold'
                    : 'border-border bg-surface2 text-muted'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  gender === 'female'
                    ? 'border-accent2 bg-accent2/20 text-accent2 font-bold'
                    : 'border-border bg-surface2 text-muted'
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setGender('other')}
                className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                  gender === 'other'
                    ? 'border-green bg-green/20 text-green font-bold'
                    : 'border-border bg-surface2 text-muted'
                }`}
              >
                Other
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. B.Tech CSE"
                required
                className="input-field w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Year of Study</label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                className="input-field w-full text-xs py-2"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>Postgrad</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-muted flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green shrink-0" />
            <span>Contact details are only revealed upon confirmed ride matches.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Save & Continue'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
