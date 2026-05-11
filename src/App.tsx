import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import TranslatorPage from './pages/TranslatorPage'
import TrainingPage from './features/signs/pages/TrainingPage'
import { clearToken, getToken } from './services/tokenStorage'

function App() {
  const [token, setTokenState] = useState<string | null>(getToken())

  const handleLogout = () => {
    clearToken()
    setTokenState(null)
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage onAuthenticated={(value) => setTokenState(value)} />}
      />
      <Route
        path="/translator"
        element={
          token ? (
            <TranslatorPage token={token} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/training"
        element={
          token ? (
            <TrainingPage token={token} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={token ? '/translator' : '/login'} replace />} />
    </Routes>
  )
}

export default App
