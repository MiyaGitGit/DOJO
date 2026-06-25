import Badge from '../ui/Badge'
import Spinner from '../ui/Spinner'
import { COULEURS_STATUT, LIBELLES_STATUT } from '../../utils/constants'

export default function StatutBadge({ statut }) {
  const couleurs = COULEURS_STATUT[statut] ?? COULEURS_STATUT.en_attente

  if (statut === 'analyse_en_cours') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <Spinner />
        <Badge texte={LIBELLES_STATUT[statut]} fond={couleurs.fond} couleurTexte={couleurs.texte} />
      </span>
    )
  }

  return (
    <Badge
      texte={LIBELLES_STATUT[statut] ?? statut}
      fond={couleurs.fond}
      couleurTexte={couleurs.texte}
    />
  )
}
