export default function ErrorBanner({ message }) {
  if (!message) return null
  return <div className="banniere-erreur">{message}</div>
}
