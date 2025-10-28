'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import FloatingWhatsApp from './FloatingWhatsApp';

interface DashboardLayoutProps {
  children: ReactNode;
  userData?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export default function DashboardLayout({ children, userData }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar userData={userData} />
      
      {/* Main content */}
      <div className="lg:pl-64 pt-16 lg:pt-0 transition-all duration-300">
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Copyright Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  © {new Date().getFullYear()} <span className="font-bold text-indigo-600 dark:text-indigo-400">FinFlow</span> by{' '}
                  <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Kinywa Tech Solutions</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Designed & Developed by <span className="font-semibold text-indigo-600 dark:text-indigo-400">Eng. Kinywa</span> • Software Developer
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-600 dark:text-indigo-400 rounded-full font-semibold border border-indigo-200 dark:border-indigo-800">
                  v1.0.0
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">🚀 Powered by Next.js</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Floating WhatsApp Button */}
      <FloatingWhatsApp />
    </div>
  );
}

