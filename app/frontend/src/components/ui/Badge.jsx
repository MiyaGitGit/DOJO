export default function Badge({ texte, fond, couleurTexte }) {
  return (
    <span className="pilule" style={{ background: fond, color: couleurTexte }}>
      {texte}
    </span>
  )
}
