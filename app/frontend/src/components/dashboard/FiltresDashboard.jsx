import { OPTIONS_FILTRE_PERTINENCE } from '../../utils/constants'

export default function FiltresDashboard({ filtrePertinence, onChangerFiltre, tri, onChangerTri }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      <select
        className="input-field"
        style={{ width: 'auto' }}
        value={filtrePertinence}
        onChange={(e) => onChangerFiltre(e.target.value)}
      >
        {OPTIONS_FILTRE_PERTINENCE.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
      <select
        className="input-field"
        style={{ width: 'auto' }}
        value={tri}
        onChange={(e) => onChangerTri(e.target.value)}
      >
        <option value="created_at">Trier par date de dépôt</option>
        <option value="date_limite_soumission">Trier par date limite de soumission</option>
      </select>
    </div>
  )
}
