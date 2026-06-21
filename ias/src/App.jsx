import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import SecurityPolicy from './pages/SecurityPolicy'
import Checklist from './pages/Checklist'
import PasswordChecker from './pages/PasswordChecker'
import Quiz from './pages/Quiz'
import SessionSimulation from './pages/SessionSimulation'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/security-policy" element={<SecurityPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/password-checker" element={<PasswordChecker />} />
          <Route path="/quiz" element={
            <ProtectedRoute><Quiz /></ProtectedRoute>
          } />
          <Route path="/session" element={<SessionSimulation />} />
          {/* Legacy paths */}
          <Route path="/dashboard/checklist" element={<Checklist />} />
          <Route path="/dashboard/password" element={<PasswordChecker />} />
          <Route path="/dashboard/quiz" element={
            <ProtectedRoute><Quiz /></ProtectedRoute>
          } />
          <Route path="/dashboard/session" element={<SessionSimulation />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
