import PertinenceBadge from './PertinenceBadge'

export default function SectionPertinence({ appelOffre }) {
  return (
    <section className="section-detail card">
      <h3>1. Évaluation de la pertinence</h3>
      <PertinenceBadge pertinence={appelOffre.pertinence} />
      <p>{appelOffre.justification_pertinence}</p>
      {appelOffre.points_attention?.length > 0 && (
        <>
          <h4>Points d'attention</h4>
          <ul>
            {appelOffre.points_attention.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
