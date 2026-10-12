'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, ArrowRight, Car, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    const finalEmail = trimmedEmail.includes('@')
      ? trimmedEmail
      : `${trimmedEmail}@srmist.edu.in`;

    if (!finalEmail.endsWith('@srmist.edu.in')) {
      setError('Access restricted: Only official @srmist.edu.in student emails are permitted.');
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
      setMessage(`Verification OTP sent to ${finalEmail}. Check your SRM student inbox.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const finalEmail = trimmedEmail.includes('@')
      ? trimmedEmail
      : `${trimmedEmail}@srmist.edu.in`;

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
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-accent/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-accent2/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="card w-full max-w-md relative z-10 border-border/70 bg-surface/85 backdrop-blur-md shadow-2xl p-7">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent to-accent2 mx-auto flex items-center justify-center shadow-lg shadow-accent/25 mb-3">
            <Car className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent2 mb-1">
            Convoy
          </h1>
          <p className="text-xs text-muted">
            Verified SRMIST Campus & Exam Transit Community
          </p>
        </div>

        {/* SRM Domain Badge */}
        <div className="mb-5 p-3 rounded-xl bg-surface2/60 border border-border flex items-center gap-2.5 text-xs text-muted">
          <ShieldCheck className="w-4 h-4 text-green shrink-0" />
          <span>Restricted to verified <strong>@srmist.edu.in</strong> student accounts.</span>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-lg bg-red/10 border-l-4 border-red text-red text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3.5 rounded-lg bg-green/10 border-l-4 border-green text-green text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                SRM NetID or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ab1234 or ab1234@srmist.edu.in"
                  required
                  disabled={loading}
                  className="input-field w-full pl-9 text-xs"
                />
              </div>
              <p className="text-[11px] text-muted mt-1">
                A one-time OTP login code will be sent to your student mail.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Sending OTP...</span>
              ) : (
                <>
                  <span>Send Login OTP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
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
                  className="input-field w-full pl-9 text-center font-mono tracking-widest text-sm font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify & Enter Convoy'}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setToken('');
              }}
              className="w-full text-center text-xs text-muted hover:text-text pt-2"
            >
              Change Email / Resend Code
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-border text-center text-[11px] text-muted space-y-1">
          <p>Zero spam. Zero public PII.</p>
          <p className="text-[10px] text-muted/70">
            Convoy is a companion project of <Link href="https://unfugly.app" className="text-accent underline">unfugly.app</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
