import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DropzoneUpload from '../components/upload/DropzoneUpload'
import ErrorBanner from '../components/ui/ErrorBanner'
import Spinner from '../components/ui/Spinner'

const ETAPES = {
  IDLE: 'idle',
  UPLOAD: 'upload',
  INSERTION: 'insertion',
  INVOCATION: 'invocation',
}

const MESSAGES_ETAPE = {
  [ETAPES.UPLOAD]: 'Envoi du fichier en cours…',
  [ETAPES.INSERTION]: 'Enregistrement de l\'appel d\'offres…',
  [ETAPES.INVOCATION]: 'Lancement de l\'analyse…',
}

export default function UploadPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [etape, setEtape] = useState(ETAPES.IDLE)
  const [erreur, setErreur] = useState(null)

  async function gererFichier(fichier) {
    setErreur(null)

    const estPdf = fichier.type === 'application/pdf' || fichier.name.toLowerCase().endsWith('.pdf')
    if (!estPdf) {
      setErreur('Seuls les fichiers PDF sont acceptés.')
      return
    }

    const chemin = `${user.id}/${crypto.randomUUID()}-${fichier.name}`

    try {
      setEtape(ETAPES.UPLOAD)
      const { error: erreurUpload } = await supabase.storage
        .from('appels-offres')
        .upload(chemin, fichier)
      if (erreurUpload) throw new Error("Le dépôt du fichier a échoué : " + erreurUpload.message)

      setEtape(ETAPES.INSERTION)
      const { data: ligne, error: erreurInsert } = await supabase
        .from('appels_offres')
        .insert({
          nom_fichier: fichier.name,
          storage_path: chemin,
          statut: 'en_attente',
          cree_par: user.id,
        })
        .select()
        .single()
      if (erreurInsert) throw new Error("L'enregistrement a échoué : " + erreurInsert.message)

      setEtape(ETAPES.INVOCATION)
      const { error: erreurInvoke } = await supabase.functions.invoke('analyze-rfp', {
        body: { appel_offre_id: ligne.id },
      })
      if (erreurInvoke) throw new Error("Le lancement de l'analyse a échoué : " + erreurInvoke.message)

      navigate(`/appels-offres/${ligne.id}`)
    } catch (erreurAttrapee) {
      setErreur(erreurAttrapee.message)
      setEtape(ETAPES.IDLE)
    }
  }

  const enTraitement = etape !== ETAPES.IDLE

  return (
    <div className="page-container" style={{ maxWidth: '640px' }}>
      <h2>Nouvel appel d'offres</h2>
      <ErrorBanner message={erreur} />
      {enTraitement ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <Spinner taille="grand" />
          <p>{MESSAGES_ETAPE[etape]}</p>
        </div>
      ) : (
        <DropzoneUpload onFichierSelectionne={gererFichier} desactive={enTraitement} />
      )}
    </div>
  )
}
