const BASE = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/university-logos`;

export const getUniversityLogoUrl = (path?: string | null): string | undefined => {
  return path ? `${BASE}/${path}` : undefined;
};