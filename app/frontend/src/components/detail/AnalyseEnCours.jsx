import Spinner from '../ui/Spinner'

export default function AnalyseEnCours() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
      <Spinner taille="grand" />
      <p>Analyse en cours, ceci peut prendre une minute.</p>
    </div>
  )
}
