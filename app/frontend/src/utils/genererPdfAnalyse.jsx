import { pdf } from '@react-pdf/renderer'
import AnalysePdfDocument from '../components/pdf/AnalysePdfDocument'

function nettoyerNomFichier(texte) {
  return texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function genererPdfAnalyse(appelOffre) {
  const blob = await pdf(<AnalysePdfDocument appelOffre={appelOffre} />).toBlob()
  const nomBase = appelOffre.numero_reference || appelOffre.titre_objet || appelOffre.nom_fichier || 'analyse'
  const nomFichier = `Analyse-AO-${nettoyerNomFichier(nomBase)}.pdf`

  const url = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomFichier
  document.body.appendChild(lien)
  lien.click()
  document.body.removeChild(lien)
  URL.revokeObjectURL(url)
}
