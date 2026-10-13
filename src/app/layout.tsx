import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { AppLayout } from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Dev Activity — Sales & Inventory',
  description: 'Sales and Inventory management system for Ateb Venue',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <StoreProvider>
          <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
            <AppLayout>{children}</AppLayout>
          </Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}
