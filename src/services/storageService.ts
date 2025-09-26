import { supabase } from './supabaseClient';

export interface StorageServiceConfig {
  bucketName: string;
  baseUrl?: string;
}

export class StorageService {
  private bucketName: string;
  private baseUrl: string;

  constructor(config: StorageServiceConfig) {
    this.bucketName = config.bucketName;
    
    // Use custom base URL if provided, otherwise construct from Supabase client
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else {
      const { data } = supabase.storage.from(this.bucketName).getPublicUrl('');
      // Remove the trailing slash and empty path from the URL
      this.baseUrl = data.publicUrl.replace(/\/$/, '');
    }
  }

  /**
   * Gets the public URL for a file in the storage bucket
   * @param path - The file path within the bucket
   * @returns The full public URL to the file
   */
  getPublicUrl(path: string): string {
    // Clean up the path - remove leading slashes and ensure proper formatting
    const cleanPath = path.replace(/^\/+/, '');
    
    return `${this.baseUrl}/${cleanPath}`;
  }

  /**
   * Gets multiple public URLs for an array of file paths
   * @param paths - Array of file paths within the bucket
   * @returns Array of public URLs
   */
  getPublicUrls(paths: string[]): string[] {
    return paths.map(path => this.getPublicUrl(path));
  }

  /**
   * Checks if a file exists at the given path by attempting to get its public URL
   * Note: This doesn't actually verify the file exists, just constructs the URL
   * @param path - The file path to check
   * @returns The public URL (existence should be verified by the caller)
   */
  getPublicUrlIfExists(path: string): string {
    return this.getPublicUrl(path);
  }

  /**
   * Gets the public URL with fallback options
   * Useful for cases where you want to try multiple possible paths
   * @param paths - Array of possible file paths to try
   * @returns The first constructed URL (note: doesn't verify existence)
   */
  getPublicUrlWithFallbacks(paths: string[]): string | null {
    if (paths.length === 0) return null;
    
    // Return the first path's URL
    // In a more advanced implementation, you might want to actually check which exists
    return this.getPublicUrl(paths[0]);
  }

  /**
   * Constructs a URL for university logos specifically
   * @param universitySlug - The university identifier (slug)
   * @param extension - File extension (default: 'png')
   * @returns Public URL for the university logo
   */
  getUniversityLogoUrl(universitySlug: string, extension: string = 'png'): string {
    const fileName = `${universitySlug}.${extension}`;
    return this.getPublicUrl(`logos/${fileName}`);
  }

  /**
   * Gets university logo URL with multiple extension fallbacks
   * @param universitySlug - The university identifier (slug)
   * @param extensions - Array of extensions to try (default: ['png', 'jpg', 'jpeg', 'svg'])
   * @returns Public URL for the first extension tried
   */
  getUniversityLogoUrlWithFallbacks(
    universitySlug: string, 
    extensions: string[] = ['png', 'jpg', 'jpeg', 'svg']
  ): string | null {
    if (extensions.length === 0) return null;
    
    const paths = extensions.map(ext => `logos/${universitySlug}.${ext}`);
    return this.getPublicUrlWithFallbacks(paths);
  }

  /**
   * Gets the bucket name this service is configured for
   */
  getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Gets the base URL this service is using
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Pre-configured storage service instances for common use cases
export const logoStorageService = new StorageService({
  bucketName: 'university-logos'
});

// If you need other storage buckets, you can create additional instances like:
// export const documentsStorageService = new StorageService({
//   bucketName: 'documents'
// });

// Export the default instance
export const storageService = logoStorageService;