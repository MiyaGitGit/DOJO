import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppelOffreStatut } from '../hooks/useAppelOffreStatut'
import { supabase } from '../lib/supabase'
import AnalyseEnCours from '../components/detail/AnalyseEnCours'
import SectionPertinence from '../components/detail/SectionPertinence'
import SectionResume from '../components/detail/SectionResume'
import SectionClausesLegales from '../components/detail/SectionClausesLegales'
import SectionRecommandation from '../components/detail/SectionRecommandation'
import ErrorBanner from '../components/ui/ErrorBanner'
import Spinner from '../components/ui/Spinner'

export default function DetailPage() {
  const { id } = useParams()
  const { appelOffre, chargement, erreur, refetch } = useAppelOffreStatut(id)
  const [relanceEnCours, setRelanceEnCours] = useState(false)
  const [transfertWrikeEnCours, setTransfertWrikeEnCours] = useState(false)

  async function reessayerAnalyse() {
    setRelanceEnCours(true)
    await supabase.functions.invoke('analyze-rfp', { body: { appel_offre_id: id } })
    setRelanceEnCours(false)
  }

  async function transfererVersWrike() {
    if (!window.confirm("Transférer cet appel d'offres vers Wrike ? Un nouveau projet sera créé dans Wrike."))
      return

    setTransfertWrikeEnCours(true)
    await supabase.functions.invoke('transfer-to-wrike', { body: { appel_offre_id: id } })
    await refetch()
    setTransfertWrikeEnCours(false)
  }

  return (
    <div className="page-container">
      <Link to="/" className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
        ← Retour au dashboard
      </Link>

      <ErrorBanner message={erreur} />

      {chargement && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spinner taille="grand" />
        </div>
      )}

      {!chargement && appelOffre && (
        <>
          <h2>{appelOffre.titre_objet ?? appelOffre.nom_fichier}</h2>

          {(appelOffre.statut === 'en_attente' || appelOffre.statut === 'analyse_en_cours') && (
            <AnalyseEnCours />
          )}

          {appelOffre.statut === 'erreur' && (
            <div className="card">
              <ErrorBanner message={appelOffre.erreur_message ?? "L'analyse a échoué."} />
              <button
                type="button"
                className="btn btn-primary"
                onClick={reessayerAnalyse}
                disabled={relanceEnCours}
              >
                {relanceEnCours ? <Spinner /> : "Réessayer l'analyse"}
              </button>
            </div>
          )}

          {appelOffre.statut === 'analyse_terminee' && (
            <>
              <SectionPertinence appelOffre={appelOffre} />
              <SectionResume appelOffre={appelOffre} />
              <SectionClausesLegales appelOffre={appelOffre} />
              <SectionRecommandation appelOffre={appelOffre} />

              <section className="section-detail card">
                <h3>Transfert vers Wrike</h3>
                <p>
                  Après lecture de l'analyse ci-dessus, décide si cet appel d'offres mérite d'être suivi
                  dans Wrike. Le transfert n'est jamais déclenché automatiquement.
                </p>

                <ErrorBanner message={appelOffre.wrike_erreur_message} />

                {appelOffre.wrike_statut === 'transfere' ? (
                  <p>
                    Déjà transféré vers Wrike
                    {appelOffre.wrike_url && (
                      <>
                        {' — '}
                        <a href={appelOffre.wrike_url} target="_blank" rel="noreferrer">
                          voir le projet
                        </a>
                      </>
                    )}
                  </p>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={transfererVersWrike}
                    disabled={transfertWrikeEnCours}
                  >
                    {transfertWrikeEnCours ? <Spinner /> : 'Transférer vers Wrike'}
                  </button>
                )}
              </section>
            </>
          )}
        </>
      )}
    </div>
  )
}
