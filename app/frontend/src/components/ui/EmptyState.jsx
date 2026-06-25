import { Link } from 'react-router-dom'

export default function EmptyState() {
  return (
    <div className="etat-vide">
      <h3>Aucun appel d'offres analysé pour l'instant</h3>
      <p>Dépose un premier AO pour lancer ton premier rapport.</p>
      <Link to="/upload" className="btn btn-primary">
        Déposer un AO
      </Link>
    </div>
  )
}
