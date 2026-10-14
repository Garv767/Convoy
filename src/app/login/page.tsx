'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Lock, AlertCircle, CheckCircle2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const getCleanEmail = () => {
    const trimmed = email.trim().toLowerCase();
    return trimmed.includes('@') ? trimmed : `${trimmed}@srmist.edu.in`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const finalEmail = getCleanEmail();

    if (!finalEmail.endsWith('@srmist.edu.in')) {
      setError('Please use your official @srmist.edu.in email address.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: finalEmail,
          options: {
            shouldCreateUser: true,
          },
        });
        if (authError) throw authError;
      }

      setOtpSent(true);
      setMessage(`Code sent to ${finalEmail}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const finalEmail = getCleanEmail();

    try {
      if (isSupabaseConfigured) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: finalEmail,
          token: token.trim(),
          type: 'email',
        });
        if (verifyError) throw verifyError;
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Dynamic Background Elements (Unfugly aesthetic) */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-[#1E88E5]/15 blur-[140px] rounded-full pointer-events-none animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#8b5cf6]/12 blur-[150px] rounded-full pointer-events-none animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '2s' }}
      />

      {/* Return to Home link */}
      <div className="w-full max-w-sm mb-4 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Convoy</span>
        </Link>
      </div>

      <div className="w-full max-w-sm bg-[#121522]/90 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-7 shadow-2xl relative z-10 overflow-hidden">
        {/* Top subtle gradient highlight line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#1E88E5] via-[#8b5cf6] to-[#10b981]" />

        {/* Header with App Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E88E5] via-[#6c8ef7] to-[#8b5cf6] p-0.5 mx-auto flex items-center justify-center shadow-[0_0_24px_rgba(30,136,229,0.35)] mb-3">
            <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8">
              <path
                d="M48 20.5C45.5 15.5 40 12 33 12C21.4 12 12 21.4 12 33C12 44.6 21.4 54 33 54C42 54 49 48 51.5 40"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path d="M25 25L41 33L25 41L29 33L25 25Z" fill="#FFFFFF" />
              <circle cx="48" cy="20.5" r="3.5" fill="#38BDF8" />
            </svg>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Sign in to Convoy
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Privacy-first SRM student ride coordination
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                SRM NetID or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ab1234 or ab1234@srmist.edu.in"
                  required
                  disabled={loading}
                  className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                We'll email a one-time OTP code to your student inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-3 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <span>Sending code...</span>
              ) : (
                <>
                  <span>Send Login Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                6-Digit Login Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="123456"
                  required
                  disabled={loading}
                  autoFocus
                  className="w-full bg-[#0c0e17] border border-white/[0.08] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 rounded-xl pl-10 pr-3.5 py-2.5 text-center font-mono tracking-widest text-base font-bold text-white outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-3 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setToken('');
              }}
              className="w-full text-center text-xs text-gray-400 hover:text-white pt-1 transition-colors cursor-pointer"
            >
              Use a different NetID
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Restricted to @srmist.edu.in accounts</span>
        </div>
      </div>
    </div>
  );
}
