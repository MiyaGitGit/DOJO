import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAppelsOffres } from '../hooks/useAppelsOffres'
import FiltresDashboard from '../components/dashboard/FiltresDashboard'
import AppelOffreRow from '../components/dashboard/AppelOffreRow'
import BarreActionsSelection from '../components/dashboard/BarreActionsSelection'
import EmptyState from '../components/ui/EmptyState'
import ErrorBanner from '../components/ui/ErrorBanner'
import Spinner from '../components/ui/Spinner'

export default function DashboardPage() {
  const { appelsOffres, chargement, erreur, refetch } = useAppelsOffres()
  const [filtrePertinence, setFiltrePertinence] = useState('toutes')
  const [tri, setTri] = useState('created_at')
  const [selection, setSelection] = useState(new Set())
  const [actionEnCours, setActionEnCours] = useState(false)
  const [erreurAction, setErreurAction] = useState(null)
  const [genererPdfEnCours, setGenererPdfEnCours] = useState(false)

  const appelOffreSelectionne =
    selection.size === 1 ? appelsOffres.find((ao) => selection.has(ao.id)) : null
  const genererPdfPossible = appelOffreSelectionne?.statut === 'analyse_terminee'

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

  function changerSelection(id, selectionne) {
    setSelection((precedent) => {
      const nouveau = new Set(precedent)
      if (selectionne) nouveau.add(id)
      else nouveau.delete(id)
      return nouveau
    })
  }

  function changerSelectionTout(selectionne) {
    setSelection(selectionne ? new Set(appelsOffresAffiches.map((ao) => ao.id)) : new Set())
  }

  async function handleSupprimer() {
    if (!window.confirm(`Supprimer définitivement ${selection.size} appel(s) d'offres ?`)) return

    setActionEnCours(true)
    setErreurAction(null)
    try {
      const idsSelectionnes = [...selection]
      const cheminsFichiers = appelsOffres
        .filter((ao) => idsSelectionnes.includes(ao.id))
        .map((ao) => ao.storage_path)

      if (cheminsFichiers.length > 0) {
        // Best-effort : un fichier déjà absent du bucket ne doit pas empêcher la suppression des lignes.
        await supabase.storage.from('appels-offres').remove(cheminsFichiers)
      }

      const { error } = await supabase.from('appels_offres').delete().in('id', idsSelectionnes)
      if (error) throw new Error(error.message)

      setSelection(new Set())
      await refetch()
    } catch (erreurAttrapee) {
      setErreurAction('La suppression a échoué : ' + erreurAttrapee.message)
    } finally {
      setActionEnCours(false)
    }
  }

  async function handleMarquerErreur() {
    if (!window.confirm(`Marquer ${selection.size} appel(s) d'offres comme en erreur ?`)) return

    setActionEnCours(true)
    setErreurAction(null)
    try {
      const { error } = await supabase
        .from('appels_offres')
        .update({ statut: 'erreur', erreur_message: 'Analyse arrêtée manuellement' })
        .in('id', [...selection])
      if (error) throw new Error(error.message)

      setSelection(new Set())
      await refetch()
    } catch (erreurAttrapee) {
      setErreurAction("L'action a échoué : " + erreurAttrapee.message)
    } finally {
      setActionEnCours(false)
    }
  }

  async function handleGenererPdf() {
    if (!appelOffreSelectionne) return

    setGenererPdfEnCours(true)
    setErreurAction(null)
    try {
      const { genererPdfAnalyse } = await import('../utils/genererPdfAnalyse')
      await genererPdfAnalyse(appelOffreSelectionne)
    } catch (erreurAttrapee) {
      setErreurAction('La génération du PDF a échoué : ' + erreurAttrapee.message)
    } finally {
      setGenererPdfEnCours(false)
    }
  }

  const touteSelectionnee =
    appelsOffresAffiches.length > 0 && appelsOffresAffiches.every((ao) => selection.has(ao.id))

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Historique des appels d'offres</h2>
        <Link to="/upload" className="btn btn-primary">
          Nouvel AO
        </Link>
      </div>

      <ErrorBanner message={erreur} />
      <ErrorBanner message={erreurAction} />

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
          <BarreActionsSelection
            nombreSelectionnes={selection.size}
            onSupprimer={handleSupprimer}
            onMarquerErreur={handleMarquerErreur}
            onGenererPdf={handleGenererPdf}
            genererPdfPossible={genererPdfPossible}
            genererPdfEnCours={genererPdfEnCours}
            enCours={actionEnCours}
          />
          <table className="tableau">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={touteSelectionnee}
                    onChange={(e) => changerSelectionTout(e.target.checked)}
                  />
                </th>
                <th>Organisme</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Pertinence</th>
                <th>Date limite</th>
              </tr>
            </thead>
            <tbody>
              {appelsOffresAffiches.map((appelOffre) => (
                <AppelOffreRow
                  key={appelOffre.id}
                  appelOffre={appelOffre}
                  selectionne={selection.has(appelOffre.id)}
                  onChangerSelection={changerSelection}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
