import { useRef, useState } from 'react'

export default function DropzoneUpload({ onFichierSelectionne, desactive }) {
  const [survol, setSurvol] = useState(false)
  const inputRef = useRef(null)

  function gererFichiers(fichiers) {
    const fichier = fichiers?.[0]
    if (fichier) onFichierSelectionne(fichier)
  }

  return (
    <div
      className={`zone-depot${survol ? ' survol' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        if (!desactive) setSurvol(true)
      }}
      onDragLeave={() => setSurvol(false)}
      onDrop={(e) => {
        e.preventDefault()
        setSurvol(false)
        if (!desactive) gererFichiers(e.dataTransfer.files)
      }}
    >
      <p>Glisse-dépose un PDF d'appel d'offres ici</p>
      <p style={{ fontSize: '0.85rem' }}>ou</p>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={desactive}
        onClick={() => inputRef.current?.click()}
      >
        Choisir un fichier
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => gererFichiers(e.target.files)}
      />
    </div>
  )
}
