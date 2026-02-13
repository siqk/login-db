import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user, profile: currentUserProfile, updateProfile, uploadAvatar, signOut } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (username) {
      loadProfileByUsername()
    }
  }, [username])

  useEffect(() => {
    if (!username && currentUserProfile) {
      setProfile(currentUserProfile)
      setFormData({
        username: currentUserProfile.username || '',
        full_name: currentUserProfile.full_name || '',
        bio: currentUserProfile.bio || ''
      })
      setLoading(false)
    }
  }, [username, currentUserProfile])

  const loadProfileByUsername = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const isOwnProfile = user && profile?.id === user.id

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (formData.username !== profile.username) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', formData.username)
        .single()

      if (existingUser) {
        setMessage({ type: 'error', text: 'Username already taken' })
        return
      }
    }

    const result = await updateProfile(formData)
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setEditing(false)
      if (formData.username !== profile.username) {
        navigate(`/${formData.username}`)
      }
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    setMessage({ type: '', text: '' })
    
    const result = await uploadAvatar(avatarFile)
    if (result.success) {
      setMessage({ type: 'success', text: 'Avatar updated successfully!' })
      setAvatarFile(null)
      setAvatarPreview(null)
    } else {
      setMessage({ type: 'error', text: result.error })
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!profile) {
    return <div className="not-found">Profile not found</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-section">
          <div className="avatar-wrapper">
            <img 
              src={avatarPreview || profile.avatar_url || 'https://via.placeholder.com/150x150?text=Avatar'} 
              alt={profile.username}
              className="avatar"
            />
            {isOwnProfile && editing && (
              <div className="avatar-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload">Choose Image</label>
                {avatarFile && (
                  <button onClick={handleAvatarUpload} className="upload-btn">
                    Upload Avatar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-info">
          {editing ? (
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  pattern="[a-z0-9_]+"
                  title="Username can only contain lowercase letters, numbers, and underscores"
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1>{profile.full_name || profile.username}</h1>
              <p className="username">@{profile.username}</p>
              {profile.bio && <p className="bio">{profile.bio}</p>}
              <p className="member-since">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
              
              {isOwnProfile && (
                <div className="profile-actions">
                  <button onClick={() => setEditing(true)} className="edit-btn">
                    Edit Profile
                  </button>
                  <button onClick={signOut} className="signout-btn">
                    Sign Out
                  </button>
                </div>
              )}
              
              {!isOwnProfile && user && (
                <Link to="/dashboard" className="back-btn">
                  <button>Back to Dashboard</button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}