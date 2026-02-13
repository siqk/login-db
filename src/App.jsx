import { Link } from 'react-router-dom'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>db-loginn</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/signup">
            <button>Sign Up</button>
          </Link>
          <Link to="/signin">
            <button>Sign In</button>
          </Link>
        </div>
      </div>
      <p className="read-the-docs">
        Authentication with Supabase + React Router
      </p>
    </div>
  )
}

export default App