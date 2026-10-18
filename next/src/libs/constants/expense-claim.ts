// FIXME: verify categories
export const expenseCategories = [
  { key: 'events', account: '', labelFi: 'Tapahtumakulut' },
  { key: 'premises', account: '', labelFi: 'Toimitilakulut' },
  { key: 'tutoring', account: '', labelFi: 'Tuutoroinnin kulut' },
  { key: 'other', account: '', labelFi: 'Muu' },
] as const;

// Row-level VAT values. Verify in the import preview that 25.5 is accepted on rows.
export const expenseVatRates = ['0', '10', '14', '25.5'] as const;

export const expenseLimits = {
  maxLines: 20,
  maxFiles: 10,
  maxFileBytes: 5 * 1024 * 1024,
  maxTotalBytes: 10 * 1024 * 1024,
  maxCsvBytes: 1024 * 1024,
} as const;

export const expenseReceiptTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;
