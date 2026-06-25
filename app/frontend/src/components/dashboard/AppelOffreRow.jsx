import { useNavigate } from 'react-router-dom'
import StatutBadge from './StatutBadge'
import PertinenceBadge from '../detail/PertinenceBadge'
import { formaterDate } from '../../utils/dateUtils'

export default function AppelOffreRow({ appelOffre, selectionne, onChangerSelection }) {
  const navigate = useNavigate()

  return (
    <tr className="ligne-cliquable" onClick={() => navigate(`/appels-offres/${appelOffre.id}`)}>
      <td onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selectionne}
          onChange={(e) => onChangerSelection(appelOffre.id, e.target.checked)}
        />
      </td>
      <td>{appelOffre.organisme ?? appelOffre.nom_fichier}</td>
      <td>{appelOffre.titre_objet ?? '—'}</td>
      <td>
        <StatutBadge statut={appelOffre.statut} />
      </td>
      <td>
        <PertinenceBadge pertinence={appelOffre.pertinence} />
      </td>
      <td>{formaterDate(appelOffre.date_limite_soumission)}</td>
    </tr>
  )
}
