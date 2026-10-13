'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Boxes, AlertCircle, Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Field validation errors
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Auth error banner
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    setUsernameError(null);
    setPasswordError(null);
    setAuthError(false);

    if (!username.trim()) {
      setUsernameError('Username is required.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required.');
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    setTimeout(() => {
      const success = login(username.trim(), password);
      if (success) {
        router.push('/dashboard');
      } else {
        setAuthError(true);
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 sm:p-10 space-y-7">
        {/* Brand & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-1">
            <Boxes className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to your account to continue.</p>
        </div>

        {/* Invalid Credentials Error Banner */}
        {authError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-rose-800">Incorrect username or password</p>
              <p className="text-xs text-rose-600 mt-0.5">Please check your details and try again.</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Username Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError(null);
                  if (authError) setAuthError(false);
                }}
                placeholder="Enter your username"
                className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition ${
                  usernameError
                    ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent'
                }`}
              />
            </div>
            {usernameError && (
              <p className="text-xs text-rose-600 font-medium mt-1.5">{usernameError}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                  if (authError) setAuthError(false);
                }}
                placeholder="Enter your password"
                className={`w-full h-11 pl-10 pr-10 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition ${
                  passwordError
                    ? 'border-rose-500 ring-2 ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-rose-600 font-medium mt-1.5">{passwordError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 active:scale-[0.99] transition shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
          <p className="font-semibold text-slate-700">Demo Login</p>
          <p className="mt-0.5">Username: <strong className="text-slate-900 font-mono">admin</strong> &nbsp;|&nbsp; Password: <strong className="text-slate-900 font-mono">password123</strong></p>
        </div>
      </div>
    </div>
  );
}
