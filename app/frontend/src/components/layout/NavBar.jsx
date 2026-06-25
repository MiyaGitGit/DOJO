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
      <Link to="/" className="navbar-marque">
        DOJO
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
