import { createHashRouter } from 'react-router-dom' // Changed from createBrowserRouter
import App from './App'
import Signup from './components/Signup'
import Signin from './components/Signin'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'

// ⚠️ CRITICAL: Use HashRouter for GitHub Pages
export const router = createHashRouter([
  { path: '/', element: <App /> },
  { path: '/signup', element: <Signup /> },
  { path: '/signin', element: <Signin /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/:username', element: <Profile /> },
])