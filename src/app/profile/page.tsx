'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { Camera, KeyRound, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, changePassword } = useStore();

  const [firstName, setFirstName] = useState(user.firstName);
  const [middleName, setMiddleName] = useState(user.middleName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [mobile, setMobile] = useState(user.mobile);
  const [username, setUsername] = useState(user.username);
  const [photoUrl, setPhotoUrl] = useState(
    user.photoUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateUser({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      username: username.trim(),
      photoUrl: photoUrl.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setPhotoUrl(fakeUrl);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 08.01 Manage Profile Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Manage Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Opened from the user menu in the sidebar footer.
          </p>
        </div>

        {/* Top Right Save Button (matching Figma 08.01) */}
        <button
          type="button"
          onClick={() => handleSave()}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#0F1E36] hover:bg-[#162744] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Saved
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Avatar & Upload Image Button */}
          <div className="md:col-span-3 flex flex-col items-center text-center space-y-4 pt-2">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt="Profile photo"
                className="w-full h-full object-cover"
              />
            </div>

            <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition">
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Right Column: Account Information Form */}
          <div className="md:col-span-9 space-y-6">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Account Information
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Row 1: Last Name, First Name, Middle Name (3 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0F1E36] focus:ring-1 focus:ring-[#0F1E36]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0F1E36] focus:ring-1 focus:ring-[#0F1E36]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0F1E36] focus:ring-1 focus:ring-[#0F1E36]"
                  />
                </div>
              </div>

              {/* Row 2: Email Address, Mobile Number (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0F1E36] focus:ring-1 focus:ring-[#0F1E36]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0F1E36] focus:ring-1 focus:ring-[#0F1E36]"
                  />
                </div>
              </div>

              {/* Row 3: Username, Password with Change Password Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0F1E36] focus:ring-1 focus:ring-[#0F1E36]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Password
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value="••••••••"
                      disabled
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-400 cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3 h-10 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shadow-2xs transition shrink-0 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                      <span>Change Password</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 08.02 Change Password Modal with live checklist */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onChangePassword={changePassword}
      />
    </div>
  );
}
