import { supabase } from './supabaseClient';
import { getUniversityLogo } from '../utils/universityLogos';

export interface SetUserUniversityParams {
  userId: string;
  name: string;
  graduated?: boolean;
  workplace?: string | null;
  logoPath?: string | null;
  logoUrl?: string | null;
}

export interface University {
  id: number;
  name: string;
  slug: string;
  logo_path?: string | null;
  logo_url?: string | null;
  created_at: string;
}

export class ProfileService {
  /**
   * Creates an empty profile for a user if one doesn't exist
   */
  async upsertEmptyProfile(userId: string): Promise<void> {
    const { error } = await supabase
      .from('home_userprofile')
      .upsert(
        {
          user_id: userId,
          timezone: 'UTC',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any,
        {
          onConflict: 'user_id',
          ignoreDuplicates: true,
        }
      );

    if (error) {
      console.error('Error upserting empty profile:', error);
      throw error;
    }
  }

  /**
   * Sets the user's university using the RPC function
   * Automatically assigns local logo if available
   */
  async setUserUniversity(params: SetUserUniversityParams): Promise<void> {
    // Check if we have a local logo for this university
    const localLogo = getUniversityLogo(params.name);
    let logoPath = params.logoPath || null;
    
    // If we have a local logo and no specific logo was provided, use a placeholder path
    // In a real app, you'd want to upload this to your storage and get the actual path
    if (localLogo && !logoPath && !params.logoUrl) {
      // For now, we'll just mark that a logo exists locally
      // The client-side components will use getUniversityLogo() to display it
      logoPath = `local_logo_${params.name.toLowerCase().replace(/\s+/g, '_')}`;
    }

    const { error } = await supabase.rpc('set_user_university', {
      p_user_id: params.userId,
      p_name: params.name,
      p_graduated: params.graduated || false,
      p_workplace: params.workplace || null,
      p_logo_path: logoPath,
      p_logo_url: params.logoUrl || null,
    } as any);

    if (error) {
      console.error('Error setting user university:', error);
      throw error;
    }
  }

  /**
   * Awards signup bonus XP to a user
   */
  async awardSignupBonus(userId: string): Promise<void> {
    const { error } = await supabase.rpc('award_xp', {
      p_user_id: userId,
      p_delta: 100,
      p_reason: 'signup_bonus',
    } as any);

    if (error) {
      console.error('Error awarding signup bonus:', error);
      throw error;
    }
  }

  /**
   * Gets a university by name (matches by normalized slug)
   */
  async getUniversityByName(name: string): Promise<University | null> {
    // Normalize the name to match the slug format
    const slug = name.toLowerCase().trim().replace(/\s+/g, ' ');
    
    const { data, error } = await supabase
      .from('home_university')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, which is okay
        return null;
      }
      console.error('Error getting university by name:', error);
      throw error;
    }

    return data;
  }

  /**
   * Gets all universities for selection
   */
  async getAllUniversities(): Promise<University[]> {
    const { data, error } = await supabase
      .from('home_university')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error getting all universities:', error);
      throw error;
    }

    return data || [];
  }
}

export const profileService = new ProfileService();