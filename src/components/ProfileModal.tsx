import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, X } from 'lucide-react';
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
      <div className="w-full sm:max-w-md bg-[#16181d] border-t sm:border border-white/[0.12] rounded-t-3xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] p-6 max-h-[92vh] overflow-y-auto relative">
        {/* Top blue highlight line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-[#1E88E5]" />

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Profile Header Avatar */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full border-2 border-[#1E88E5] bg-[#1E88E5]/20 mx-auto flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_15px_rgba(30,136,229,0.25)] mb-3">
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
              className="w-full bg-[#101216] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
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
                className="w-full bg-[#101216] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
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
                className="w-full bg-[#101216] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all font-mono"
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
                    ? 'border-[#1E88E5] bg-[#1E88E5]/20 text-[#60a5fa] shadow-sm'
                    : 'border-white/[0.08] bg-[#101216] text-gray-400 hover:text-white'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  gender === 'female'
                    ? 'border-rose-400/50 bg-rose-500/20 text-rose-300 shadow-sm'
                    : 'border-white/[0.08] bg-[#101216] text-gray-400 hover:text-white'
                }`}
              >
                Female
              </button>
              <button
                type="button"
                onClick={() => setGender('other')}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                  gender === 'other'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                    : 'border-white/[0.08] bg-[#101216] text-gray-400 hover:text-white'
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
                className="w-full bg-[#101216] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Year of Study
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(Number(e.target.value))}
                className="w-full bg-[#101216] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition-all cursor-pointer"
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
            className="btn-primary w-full text-xs py-3 flex items-center justify-center gap-2 mt-2 shadow-md"
          >
            <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Complete Setup & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Unfugly Ecosystem Links */}
          <div className="flex items-center justify-center gap-7 pt-4 border-t border-white/[0.08]">
            <a
              href="https://extension.unfugly.app"
              target="_blank"
              rel="noopener noreferrer"
              title="Chrome Extension"
              className="text-gray-500 hover:text-[#1E88E5] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 512 512" fill="currentColor">
                <path d="M464 128h-80V80c0-44.18-35.82-80-80-80s-80 35.82-80 80v48h-80c-26.51 0-48 21.49-48 48v80H48c-26.51 0-48 21.49-48 48s21.49 48 48 48h48v80c0 26.51 21.49 48 48 48h80v48c0 44.18 35.82 80 80 80s80-35.82 80-80v-48h80c26.51 0 48-21.49 48-48v-80h48c26.51 0 48-21.49 48-48s-21.49-48-48-48h-48v-80c0-26.51-21.49-48-48-48z"/>
              </svg>
            </a>
            <a
              href="https://chat.whatsapp.com/GlmnZ3g0Zb8IXFTa3tOImT"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp Community"
              className="text-gray-500 hover:text-[#25D366] transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.019 14.12 1.01 11.52 1.01c-5.448 0-9.873 4.37-9.878 9.802-.002 1.743.46 3.447 1.34 4.954l-.99 3.614 3.655-.958zm12.335-5.464c-.302-.15-1.786-.882-2.07-.987-.282-.104-.489-.156-.694.15-.205.307-.795.987-.975 1.191-.18.205-.359.23-.66.08-1.597-.799-2.617-1.436-3.666-3.235-.278-.475.278-.44.795-1.474.086-.174.043-.326-.021-.475-.065-.15-.544-1.309-.745-1.792-.195-.47-.393-.406-.54-.413-.14-.007-.301-.008-.461-.008-.161 0-.422.06-.643.302-.221.241-.844.824-.844 2.01 0 1.185.864 2.33 1.025 2.502.161.171 1.7 2.593 4.12 3.633.576.248 1.025.395 1.376.507.579.183 1.106.157 1.522.095.464-.069 1.487-.607 1.695-1.191.208-.585.208-1.087.146-1.191-.063-.105-.23-.156-.53-.307z"/>
              </svg>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
