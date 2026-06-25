import Spinner from '../ui/Spinner'

export default function BarreActionsSelection({
  nombreSelectionnes,
  onSupprimer,
  onMarquerErreur,
  onGenererPdf,
  genererPdfPossible,
  genererPdfEnCours,
  enCours,
}) {
  if (nombreSelectionnes === 0) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: 'var(--gris-clair)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
      }}
    >
      <span>{nombreSelectionnes} sélectionné(s)</span>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={enCours || genererPdfEnCours || !genererPdfPossible}
        onClick={onGenererPdf}
      >
        {genererPdfEnCours ? <Spinner /> : 'Générer PDF'}
      </button>
      <button type="button" className="btn btn-secondary" disabled={enCours} onClick={onMarquerErreur}>
        Marquer comme erreur
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={enCours}
        style={{ color: 'var(--couleur-danger)' }}
        onClick={onSupprimer}
      >
        Supprimer
      </button>
    </div>
  )
}
