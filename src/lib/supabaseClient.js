// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://opixidygpndbfuisjkrk.supabase.co'
const supabaseAnonKey = 'sb_publishable_N6RdTgjgUHQbdtvPX9uPqA_VTraUegI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to ensure profile exists
export const ensureProfile = async (userId, userData) => {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            username: userData?.username || userData?.user_metadata?.username || `user_${Date.now()}`,
            full_name: userData?.full_name || userData?.user_metadata?.full_name || '',
            avatar_url: null,
            bio: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
      
      if (error) console.error('Error creating profile:', error)
    }
  } catch (error) {
    console.error('Error ensuring profile:', error)
  }
}