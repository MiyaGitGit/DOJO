import { formaterDate } from '../../utils/dateUtils'

export default function SectionResume({ appelOffre }) {
  const resumeComplet = appelOffre.resume_complet ?? {}
  const datesCles = resumeComplet.dates_cles ?? {}
  const livrables = resumeComplet.livrables_attendus ?? []
  const criteres = resumeComplet.criteres_selection ?? []
  const exigences = resumeComplet.exigences_qualification ?? []
  const elementsLienMiyagi = resumeComplet.elements_lien_miyagi ?? []

  return (
    <section className="section-detail card">
      <h3>2. Résumé de l'appel d'offres</h3>

      <table className="tableau">
        <tbody>
          <tr>
            <td>Organisme</td>
            <td>{appelOffre.organisme ?? 'Non précisé'}</td>
          </tr>
          <tr>
            <td>Titre / Objet</td>
            <td>{appelOffre.titre_objet ?? 'Non précisé'}</td>
          </tr>
          <tr>
            <td>Numéro de référence</td>
            <td>{appelOffre.numero_reference ?? 'Non précisé'}</td>
          </tr>
          <tr>
            <td>Budget estimé</td>
            <td>{appelOffre.budget_estime ?? 'Non précisé'}</td>
          </tr>
          <tr>
            <td>Date limite de soumission</td>
            <td>{formaterDate(appelOffre.date_limite_soumission)}</td>
          </tr>
          <tr>
            <td>Publication</td>
            <td>{datesCles.publication ?? 'Non précisé'}</td>
          </tr>
          <tr>
            <td>Début du mandat</td>
            <td>{datesCles.debut_mandat ?? 'Non précisé'}</td>
          </tr>
          <tr>
            <td>Durée du mandat</td>
            <td>{datesCles.duree_mandat ?? 'Non précisé'}</td>
          </tr>
        </tbody>
      </table>

      <h4>Description du mandat</h4>
      <p>{appelOffre.resume_mandat}</p>

      {livrables.length > 0 && (
        <>
          <h4>Livrables attendus</h4>
          <ul>
            {livrables.map((livrable, index) => (
              <li key={index}>{livrable}</li>
            ))}
          </ul>
        </>
      )}

      {criteres.length > 0 && (
        <>
          <h4>Critères de sélection</h4>
          <table className="tableau">
            <thead>
              <tr>
                <th>Critère</th>
                <th>Pondération</th>
              </tr>
            </thead>
            <tbody>
              {criteres.map((critere, index) => (
                <tr key={index}>
                  <td>{critere.critere}</td>
                  <td>{critere.ponderation ?? 'Non précisé'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {exigences.length > 0 && (
        <>
          <h4>Exigences de qualification</h4>
          <ul>
            {exigences.map((exigence, index) => (
              <li key={index}>{exigence}</li>
            ))}
          </ul>
        </>
      )}

      {elementsLienMiyagi.length > 0 && (
        <>
          <h4>Éléments en lien avec l'offre de Miyagi</h4>
          <ul>
            {elementsLienMiyagi.map((element, index) => (
              <li key={index}>
                <strong>{element.volet}</strong> — {element.description}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
