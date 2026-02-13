import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin')
    }
  }, [user, loading, navigate])

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {profile && (
        <div className="dashboard-content">
          <div className="user-info">
            <Link to={`/${profile.username}`} className="profile-link">
              <img 
                src={profile.avatar_url || 'https://via.placeholder.com/40x40?text=User'} 
                alt={profile.username}
                className="avatar-small"
              />
              <span>@{profile.username}</span>
            </Link>
            <p>Welcome, {profile.full_name || profile.username}!</p>
          </div>
          
          <div className="dashboard-actions">
            <Link to={`/${profile.username}`}>
              <button>View My Profile</button>
            </Link>
            <button onClick={signOut}>Sign Out</button>
          </div>
        </div>
      )}
    </div>
  )
}