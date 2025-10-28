'use client';

import { useState } from 'react';
import { CURRENCIES, type CurrencyCode } from '@/lib/currencies';

interface CurrencySelectorProps {
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function CurrencySelector({ currentCurrency, onCurrencyChange }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (currencyCode: string) => {
    onCurrencyChange(currencyCode);
    setIsOpen(false);
  };

  const selectedCurrency = CURRENCIES[currentCurrency as CurrencyCode] || CURRENCIES.KES;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="text-lg font-bold">{selectedCurrency.symbol}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedCurrency.code}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Select Currency
              </div>
              {Object.entries(CURRENCIES).map(([code, currency]) => (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    currentCurrency === code
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-bold w-8">{currency.symbol}</span>
                    <div className="text-left">
                      <div className="font-semibold">{currency.code}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{currency.name}</div>
                    </div>
                  </div>
                  {currentCurrency === code && (
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

