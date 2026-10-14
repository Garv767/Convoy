import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, X, User, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full sm:max-w-md bg-[#121522] border-t sm:border border-white/[0.12] rounded-t-3xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-6 max-h-[92vh] overflow-y-auto relative">
        {/* Top subtle gradient highlight line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#1E88E5] via-[#8b5cf6] to-[#10b981]" />

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Profile Header Avatar (Unfugly design style) */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full border-2 border-[#1E88E5] bg-gradient-to-br from-[#1E88E5]/30 to-[#8b5cf6]/20 mx-auto flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_20px_rgba(30,136,229,0.3)] mb-3">
            {fullName ? fullName[0].toUpperCase() : 'S'}
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isEditing ? 'Edit Profile' : 'Student Profile Setup'}
            </h2>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Verified as <span className="font-mono text-[#60a5fa]">{userEmail}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Garv Rahut"
              required
              className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                required
                className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Same as phone"
                className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  gender === 'male'
                    ? 'border-[#1E88E5] bg-[#1E88E5]/20 text-[#60a5fa] shadow-[0_0_12px_rgba(30,136,229,0.25)]'
                    : 'border-white/[0.08] bg-[#0c0e17] text-gray-400 hover:text-white'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  gender === 'female'
                    ? 'border-[#8b5cf6] bg-[#8b5cf6]/20 text-[#c084fc] shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                    : 'border-white/[0.08] bg-[#0c0e17] text-gray-400 hover:text-white'
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setGender('other')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  gender === 'other'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'border-white/[0.08] bg-[#0c0e17] text-gray-400 hover:text-white'
                }`}
              >
                Other
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. B.Tech CSE"
                required
                className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Year of Study
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>Postgrad</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.05]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero-PII guarantee: contact numbers unlock only upon bilateral match acceptance.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full text-xs py-3 flex items-center justify-center gap-2 mt-2 shadow-lg"
          >
            <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Complete Setup & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
