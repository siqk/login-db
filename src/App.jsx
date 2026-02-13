import { Link } from 'react-router-dom'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
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
        Click on the Vite logo to learn more
      </p>
    </div>
  )
}

export default App