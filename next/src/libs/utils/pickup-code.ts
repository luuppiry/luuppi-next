/**
 * Generates a random 6-character alphanumeric code (uppercase)
 */
export function generatePickupCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  // Generate 6 random characters
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

/**
 * Validates a pickup code format
 */
export function isValidPickupCode(code: string): boolean {
  const regex = /^[A-Z0-9]{6}$/;
  return regex.test(code.toUpperCase());
}
