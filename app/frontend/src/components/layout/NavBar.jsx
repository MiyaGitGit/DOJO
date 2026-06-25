import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function NavBar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  async function handleSignOut() {
    await signOut()
    navigate('/connexion')
  }

  return (
    <nav className="navbar">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--miyagi-blanc)',
            borderRadius: 'var(--rayon-pilule)',
            padding: '0.4rem 0.85rem',
          }}
        >
          <img src="/miyagi-logo.png" alt="Miyagi" style={{ height: '20px', display: 'block' }} />
        </span>
        <span className="navbar-marque" style={{ marginLeft: '1rem' }}>
          DOJO
        </span>
      </Link>
      <div className="navbar-actions">
        <Link to="/upload">Nouvel AO</Link>
        <button type="button" className="btn btn-secondary" onClick={handleSignOut}>
          Déconnexion
        </button>
      </div>
    </nav>
  )
}
