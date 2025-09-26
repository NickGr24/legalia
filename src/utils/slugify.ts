/**
 * Normalizes a university name to match the database slug format
 * Same normalization as the backend: lowercase, trim, collapse whitespace
 */
export const slugify = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' '); // Collapse multiple spaces to single space
};

/**
 * Creates a URL-friendly slug from a string
 */
export const createUrlSlug = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Collapse multiple hyphens
    .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
};