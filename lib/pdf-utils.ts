'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportData } from './report-utils';
import { formatCurrency, getCurrencySymbol } from './currencies';

export function generatePDFReport(reportData: ReportData, currency: string = 'KES'): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('💰 FinFlow', 15, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(reportData.period, 15, 30);

  // Date range
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(10);
  doc.text(`${reportData.startDate} to ${reportData.endDate}`, pageWidth - 15, 20, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 15, 28, { align: 'right' });

  yPos = 50;

  // Summary Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary', 15, yPos);
  yPos += 10;

  // Summary boxes
  const summaryData = [
    { label: 'Total Income', value: formatCurrency(reportData.totalIncome, currency), color: [34, 197, 94] },
    { label: 'Total Expenses', value: formatCurrency(reportData.totalExpenses, currency), color: [239, 68, 68] },
    { label: 'Net Balance', value: formatCurrency(reportData.netBalance, currency), color: reportData.netBalance >= 0 ? [34, 197, 94] : [239, 68, 68] },
    { label: 'Transactions', value: reportData.transactionCount.toString(), color: [99, 102, 241] }
  ];

  const boxWidth = (pageWidth - 40) / 4;
  let xPos = 15;

  summaryData.forEach((item, index) => {
    // Box background
    doc.setFillColor(item.color[0], item.color[1], item.color[2], 0.1);
    doc.roundedRect(xPos, yPos, boxWidth - 3, 25, 3, 3, 'F');
    
    // Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(item.label, xPos + 3, yPos + 8);
    
    // Value
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.text(item.value, xPos + 3, yPos + 18);
    
    xPos += boxWidth;
  });

  yPos += 35;

  // Key Metrics
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Savings Rate: ${reportData.savingsRate.toFixed(1)}%`, 15, yPos);
  doc.text(`Avg Daily Expense: ${formatCurrency(reportData.avgDailyExpense, currency)}`, pageWidth / 2, yPos);
  yPos += 15;

  // Category Breakdown
  if (reportData.categoryBreakdown.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Expenses by Category', 15, yPos);
    yPos += 7;

    const categoryTableData = reportData.categoryBreakdown.slice(0, 10).map(cat => [
      cat.icon + ' ' + cat.category,
      formatCurrency(cat.amount, currency),
      cat.percentage.toFixed(1) + '%',
      cat.count.toString()
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Amount', 'Percentage', 'Transactions']],
      body: categoryTableData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Check if we need a new page
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = 20;
  }

  // Top Expenses
  if (reportData.topExpenses.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 5 Expenses', 15, yPos);
    yPos += 7;

    const topExpensesData = reportData.topExpenses.map(exp => [
      exp.date,
      exp.category,
      exp.description,
      formatCurrency(exp.amount, currency)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: topExpensesData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 35, halign: 'right' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Payment Methods
  if (reportData.paymentMethodBreakdown.length > 0 && yPos < pageHeight - 60) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Methods', 15, yPos);
    yPos += 7;

    const paymentMethodData = reportData.paymentMethodBreakdown.map(pm => [
      pm.method,
      formatCurrency(pm.amount, currency),
      pm.percentage.toFixed(1) + '%'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Payment Method', 'Amount', 'Percentage']],
      body: paymentMethodData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 30, halign: 'center' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // New page for monthly trend
  if (reportData.monthlyTrend.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Trend', 15, yPos);
    yPos += 7;

    const trendData = reportData.monthlyTrend.map(trend => [
      trend.month,
      formatCurrency(trend.income, currency),
      formatCurrency(trend.expenses, currency),
      formatCurrency(trend.balance, currency)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Month', 'Income', 'Expenses', 'Balance']],
      body: trendData,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 45, halign: 'right' },
        2: { cellWidth: 45, halign: 'right' },
        3: { cellWidth: 45, halign: 'right' }
      }
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount} • FinFlow Financial Report`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  const filename = `finflow_${reportData.period.toLowerCase().replace(' ', '_')}_${reportData.startDate}_to_${reportData.endDate}.pdf`;
  doc.save(filename);
}

