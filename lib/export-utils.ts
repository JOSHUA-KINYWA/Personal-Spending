'use client';

import type { Transaction } from './types';
import { formatDate } from './utils';
import { getCurrencySymbol } from './currencies';

// Convert transactions to CSV format
export function exportToCSV(transactions: Transaction[], currency: string = 'KES'): string {
  if (transactions.length === 0) {
    return 'No transactions to export';
  }

  const currencySymbol = getCurrencySymbol(currency);

  // CSV Headers
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    'Amount',
    'Payment Method',
    'Is Split',
    'Split Details'
  ];

  // CSV Rows
  const rows = transactions.map(t => {
    const splitDetails = t.is_split && t.splits && t.splits.length > 0
      ? t.splits.map(s => `${s.category?.name || 'Uncategorized'}: ${currencySymbol}${s.amount.toFixed(2)}${s.notes ? ` (${s.notes})` : ''}`).join('; ')
      : '';

    return [
      formatDate(t.transaction_date),
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.is_split ? 'Split Transaction' : (t.category?.name || 'Uncategorized'),
      `"${(t.description || '').replace(/"/g, '""')}"`, // Escape quotes
      `${currencySymbol}${t.amount.toFixed(2)}`,
      t.payment_method || '',
      t.is_split ? 'Yes' : 'No',
      `"${splitDetails.replace(/"/g, '""')}"` // Escape quotes
    ];
  });

  // Combine headers and rows
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
}

// Download CSV file
export function downloadCSV(csv: string, filename: string = 'transactions.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Convert transactions to Excel-compatible format (TSV for Excel compatibility)
export function exportToExcel(transactions: Transaction[], currency: string = 'KES'): string {
  if (transactions.length === 0) {
    return 'No transactions to export';
  }

  const currencySymbol = getCurrencySymbol(currency);

  // Excel/TSV Headers
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    'Amount',
    'Currency',
    'Payment Method',
    'Is Split',
    'Split Details'
  ];

  // Excel/TSV Rows
  const rows = transactions.map(t => {
    const splitDetails = t.is_split && t.splits && t.splits.length > 0
      ? t.splits.map(s => `${s.category?.name || 'Uncategorized'}: ${s.amount.toFixed(2)}${s.notes ? ` (${s.notes})` : ''}`).join('; ')
      : '';

    return [
      t.transaction_date,
      t.type.charAt(0).toUpperCase() + t.type.slice(1),
      t.is_split ? 'Split Transaction' : (t.category?.name || 'Uncategorized'),
      (t.description || '').replace(/\t/g, ' '), // Replace tabs with spaces
      t.amount.toFixed(2),
      currency,
      t.payment_method || '',
      t.is_split ? 'Yes' : 'No',
      splitDetails.replace(/\t/g, ' ') // Replace tabs with spaces
    ];
  });

  // Combine headers and rows with tabs (TSV format - Excel compatible)
  const tsv = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  return tsv;
}

// Download Excel file (TSV format)
export function downloadExcel(tsv: string, filename: string = 'transactions.xls'): void {
  const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Generate filename with date range
export function generateFilename(
  format: 'csv' | 'excel',
  startDate?: string,
  endDate?: string
): string {
  const today = new Date().toISOString().split('T')[0];
  const extension = format === 'csv' ? 'csv' : 'xls';
  
  if (startDate && endDate) {
    return `finflow_transactions_${startDate}_to_${endDate}.${extension}`;
  } else if (startDate) {
    return `finflow_transactions_from_${startDate}.${extension}`;
  } else if (endDate) {
    return `finflow_transactions_until_${endDate}.${extension}`;
  } else {
    return `finflow_transactions_${today}.${extension}`;
  }
}

// Export transactions summary
export function exportSummaryToCSV(
  transactions: Transaction[],
  currency: string = 'KES'
): string {
  const currencySymbol = getCurrencySymbol(currency);
  
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const netBalance = totalIncome - totalExpenses;

  // Category breakdown
  const categoryMap = new Map<string, number>();
  
  transactions.forEach(t => {
    if (t.type === 'expense') {
      if (t.is_split && t.splits && t.splits.length > 0) {
        t.splits.forEach(split => {
          const catName = split.category?.name || 'Uncategorized';
          categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(split.amount));
        });
      } else {
        const catName = t.category?.name || 'Uncategorized';
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(t.amount));
      }
    }
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => `${cat},${currencySymbol}${amount.toFixed(2)}`)
    .join('\n');

  // Build summary
  const summary = [
    'FINFLOW TRANSACTION SUMMARY',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    'OVERVIEW',
    `Total Transactions,${transactions.length}`,
    `Total Income,${currencySymbol}${totalIncome.toFixed(2)}`,
    `Total Expenses,${currencySymbol}${totalExpenses.toFixed(2)}`,
    `Net Balance,${currencySymbol}${netBalance.toFixed(2)}`,
    '',
    'EXPENSES BY CATEGORY',
    'Category,Amount',
    categoryBreakdown,
    '',
    'DETAILED TRANSACTIONS',
    ...exportToCSV(transactions, currency).split('\n')
  ].join('\n');

  return summary;
}

