import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppelsOffres } from '../hooks/useAppelsOffres'
import FiltresDashboard from '../components/dashboard/FiltresDashboard'
import AppelOffreRow from '../components/dashboard/AppelOffreRow'
import EmptyState from '../components/ui/EmptyState'
import ErrorBanner from '../components/ui/ErrorBanner'
import Spinner from '../components/ui/Spinner'

export default function DashboardPage() {
  const { appelsOffres, chargement, erreur } = useAppelsOffres()
  const [filtrePertinence, setFiltrePertinence] = useState('toutes')
  const [tri, setTri] = useState('created_at')

  const appelsOffresAffiches = useMemo(() => {
    let resultat = appelsOffres
    if (filtrePertinence !== 'toutes') {
      resultat = resultat.filter((ao) => ao.pertinence === filtrePertinence)
    }
    return [...resultat].sort((a, b) => {
      const valeurA = a[tri]
      const valeurB = b[tri]
      if (!valeurA) return 1
      if (!valeurB) return -1
      return new Date(valeurB) - new Date(valeurA)
    })
  }, [appelsOffres, filtrePertinence, tri])

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Historique des appels d'offres</h2>
        <Link to="/upload" className="btn btn-primary">
          Nouvel AO
        </Link>
      </div>

      <ErrorBanner message={erreur} />

      {chargement ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spinner taille="grand" />
        </div>
      ) : appelsOffres.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="card">
          <FiltresDashboard
            filtrePertinence={filtrePertinence}
            onChangerFiltre={setFiltrePertinence}
            tri={tri}
            onChangerTri={setTri}
          />
          <table className="tableau">
            <thead>
              <tr>
                <th>Organisme</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Pertinence</th>
                <th>Date limite</th>
              </tr>
            </thead>
            <tbody>
              {appelsOffresAffiches.map((appelOffre) => (
                <AppelOffreRow key={appelOffre.id} appelOffre={appelOffre} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
