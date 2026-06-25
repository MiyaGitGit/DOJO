import Badge from '../ui/Badge'
import { COULEURS_PERTINENCE, LIBELLES_PERTINENCE } from '../../utils/constants'

export default function PertinenceBadge({ pertinence }) {
  if (!pertinence) return null
  const couleurs = COULEURS_PERTINENCE[pertinence]
  return (
    <Badge texte={LIBELLES_PERTINENCE[pertinence]} fond={couleurs.fond} couleurTexte={couleurs.texte} />
  )
}
