import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        getProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getProfile = async (userId) => {
    try {
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        const { data: userData } = await supabase.auth.getUser()
        const username = userData.user?.email?.split('@')[0] || `user_${Date.now()}`
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              username: username,
              full_name: '',
              avatar_url: null,
              bio: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (insertError) throw insertError
        data = newProfile
      } else if (error) {
        throw error
      }

      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error
      
      setProfile(prev => ({ ...prev, ...updates, updated_at: new Date().toISOString() }))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const uploadAvatar = async (file) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await updateProfile({ avatar_url: publicUrl })
      return { success: true, url: publicUrl }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}