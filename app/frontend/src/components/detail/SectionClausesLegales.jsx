import Badge from '../ui/Badge'
import { COULEURS_RISQUE } from '../../utils/constants'

export default function SectionClausesLegales({ appelOffre }) {
  const clauses = appelOffre.clauses_legales ?? []

  return (
    <section className="section-detail card">
      <h3>3. Analyse des clauses légales</h3>

      {clauses.length > 0 ? (
        <table className="tableau">
          <thead>
            <tr>
              <th>Clause</th>
              <th>Résumé</th>
              <th>Risque</th>
            </tr>
          </thead>
          <tbody>
            {clauses.map((clause, index) => {
              const couleurs = COULEURS_RISQUE[clause.niveau_risque] ?? COULEURS_RISQUE.Modéré
              return (
                <tr key={index}>
                  <td>{clause.titre}</td>
                  <td>{clause.resume}</td>
                  <td>
                    <Badge texte={clause.niveau_risque} fond={couleurs.fond} couleurTexte={couleurs.texte} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p>Aucune clause légale relevée.</p>
      )}

      <h4>Résumé des risques légaux</h4>
      <p>{appelOffre.resume_risques_legaux}</p>
    </section>
  )
}
