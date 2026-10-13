'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Field validation errors (01.02 Required Fields)
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Auth error banner (01.03 Invalid Credentials)
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
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F4F6F8]">
      {/* Brand & Logo Header - Above Card */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-[8px] bg-[#0F1E36] flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm select-none">
          DA
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#0F1E36]">
          Dev Activity
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 p-8 sm:p-9">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold tracking-tight text-[#0F1E36]">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to your account to continue.
          </p>
        </div>

        {/* 01.03 Invalid Credentials Error Banner */}
        {authError && (
          <div className="p-3.5 mb-5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-xs font-semibold text-red-900">
                Incorrect username or password
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Please check your details and try again.
              </p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError) setUsernameError(null);
                if (authError) setAuthError(false);
              }}
              placeholder="Enter your username"
              className={`w-full h-11 px-3.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition ${
                usernameError || authError
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-slate-300 focus:border-[#0F1E36] focus:ring-1 focus:ring-[#0F1E36]'
              }`}
            />
            {usernameError && (
              <p className="text-xs text-red-600 mt-1.5 font-normal">
                {usernameError}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                  if (authError) setAuthError(false);
                }}
                placeholder="Enter your password"
                className={`w-full h-11 px-3.5 pr-10 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition ${
                  passwordError || authError
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-slate-300 focus:border-[#0F1E36] focus:ring-1 focus:ring-[#0F1E36]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-600 mt-1.5 font-normal">
                {passwordError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#0F1E36] hover:bg-[#162744] active:bg-[#0A1424] text-white font-medium text-sm transition flex items-center justify-center cursor-pointer disabled:opacity-70 shadow-sm"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
