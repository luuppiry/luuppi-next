/**
 * Generates a random 6-character alphanumeric code (uppercase)
 * Format: ABC123 (3 letters + 3 numbers)
 */
export function generatePickupCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding I and O to avoid confusion
  const numbers = '23456789'; // Excluding 0 and 1 to avoid confusion

  let code = '';

  // Generate 3 random letters
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Generate 3 random numbers
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return code;
}

/**
 * Validates a pickup code format (6 characters: 3 letters + 3 numbers)
 */
export function isValidPickupCode(code: string): boolean {
  const regex = /^[A-Z]{3}[0-9]{3}$/;
  return regex.test(code.toUpperCase());
}
