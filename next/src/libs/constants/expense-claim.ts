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
