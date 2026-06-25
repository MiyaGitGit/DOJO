export default function Spinner({ taille }) {
  const classe = taille === 'grand' ? 'spinner spinner-grand' : 'spinner'
  return <span className={classe} role="status" aria-label="Chargement" />
}
