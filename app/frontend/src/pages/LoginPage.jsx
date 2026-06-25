import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ErrorBanner from '../components/ui/ErrorBanner'
import Spinner from '../components/ui/Spinner'

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErreur(null)
    setEnvoiEnCours(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch {
      setErreur('Email ou mot de passe incorrect.')
    } finally {
      setEnvoiEnCours(false)
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: '420px' }}>
      <div className="card">
        <h2>DOJO</h2>
        <p style={{ color: 'var(--gris-moyen)', marginTop: 0 }}>
          Connexion à l'outil d'analyse d'appels d'offres Miyagi
        </p>
        <ErrorBanner message={erreur} />
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="champ-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="champ-label" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={envoiEnCours} style={{ width: '100%' }}>
            {envoiEnCours ? <Spinner /> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
