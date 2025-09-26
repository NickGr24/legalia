/**
 * Validates if the email address is in a valid format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || email.trim().length === 0) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates if the password meets minimum requirements
 */
export const isValidPassword = (password: string): boolean => {
  if (!password) return false;
  return password.length >= 6;
};

/**
 * Validates if a field is not empty after trimming
 */
export const isNonEmpty = (value: string): boolean => {
  if (!value) return false;
  return value.trim().length > 0;
};

/**
 * Validates if a name/pseudonym meets minimum length requirements
 */
export const isValidName = (name: string): boolean => {
  if (!name) return false;
  return name.trim().length >= 2;
};

/**
 * Validates if university name is selected (not empty)
 */
export const isValidUniversity = (universityName: string): boolean => {
  if (!universityName) return false;
  const trimmed = universityName.trim();
  return trimmed.length > 0;
};