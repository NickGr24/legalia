-- =====================================================
-- WEEKLY LEADERBOARD RESET AUTOMATION
-- =====================================================

-- Option 1: Using pg_cron extension (if available in your Supabase instance)
-- This will reset the weekly leaderboard every Monday at 00:00 UTC
-- SELECT cron.schedule('weekly-leaderboard-reset', '0 0 * * 1', 'SELECT reset_weekly_leaderboard();');

-- Option 2: Supabase Edge Function approach (recommended)
-- Create this as a Supabase Edge Function and call it via cron job service

-- Edge Function code (TypeScript):
/*
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Call the weekly reset function
    const { error } = await supabase.rpc('reset_weekly_leaderboard')
    
    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Weekly leaderboard reset completed' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})
*/

-- Option 3: Application-level check (fallback)
-- Call this function before displaying leaderboards to ensure weekly reset
-- This is automatically handled by check_and_reset_weekly_leaderboard() function

-- To set up the cron job externally (using services like GitHub Actions, Vercel Cron, etc.):
-- 1. Create an endpoint that calls: SELECT check_and_reset_weekly_leaderboard();
-- 2. Schedule it to run every Monday at 00:00 UTC
-- 3. Or call it before any leaderboard display as a safety check