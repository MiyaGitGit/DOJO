export default function SectionRecommandation({ appelOffre }) {
  return (
    <section className="section-detail card">
      <h3>4. Recommandation</h3>
      <div className="encadre-recommandation">
        <p style={{ margin: 0 }}>{appelOffre.recommandation}</p>
      </div>
    </section>
  )
}
