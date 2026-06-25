import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formaterDate } from '../../utils/dateUtils'
import { COULEURS_PERTINENCE, LIBELLES_PERTINENCE, COULEURS_RISQUE } from '../../utils/constants'

const COULEUR_MARRON = '#544341'
const COULEUR_GRIS_MOYEN = '#9b9492'
const COULEUR_GRIS_CLAIR = '#f4f2f1'
const COULEUR_GRIS_BORDURE = '#e3dfdd'
const COULEUR_ORANGE = '#ff7300'

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COULEUR_MARRON,
  },
  enteteTitre: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  enteteSousTitre: { fontSize: 11, color: COULEUR_GRIS_MOYEN, marginBottom: 2 },
  enteteMeta: { fontSize: 9, color: COULEUR_GRIS_MOYEN, marginTop: 12 },
  separateurEntete: { borderBottomWidth: 1, borderBottomColor: COULEUR_GRIS_BORDURE, marginBottom: 20, paddingBottom: 16 },
  section: { marginBottom: 18 },
  titreSection: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COULEUR_GRIS_BORDURE,
  },
  titreSousSection: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', marginTop: 10, marginBottom: 5 },
  paragraphe: { fontSize: 10, lineHeight: 1.5, marginBottom: 6 },
  ligneListe: { flexDirection: 'row', marginBottom: 3, paddingRight: 4 },
  puce: { width: 10, fontSize: 10 },
  texteListe: { flex: 1, fontSize: 10, lineHeight: 1.4 },
  pilule: {
    alignSelf: 'flex-start',
    borderRadius: 9,
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
  },
  table: { borderTopWidth: 1, borderTopColor: COULEUR_GRIS_BORDURE },
  ligneTable: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COULEUR_GRIS_BORDURE },
  enteteTable: { backgroundColor: COULEUR_GRIS_CLAIR },
  celluleEntete: {
    padding: 6,
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: COULEUR_GRIS_MOYEN,
    textTransform: 'uppercase',
  },
  cellule: { padding: 6, fontSize: 9, lineHeight: 1.3 },
  encadreRecommandation: {
    backgroundColor: COULEUR_GRIS_CLAIR,
    borderLeftWidth: 3,
    borderLeftColor: COULEUR_ORANGE,
    borderRadius: 3,
    padding: 12,
  },
})

function Pilule({ texte, couleurs, style }) {
  if (!texte) return null
  return <Text style={[styles.pilule, { backgroundColor: couleurs.fond, color: couleurs.texte }, style]}>{texte}</Text>
}

function Liste({ items }) {
  if (!items?.length) return null
  return (
    <View>
      {items.map((item, index) => (
        <View key={index} style={styles.ligneListe}>
          <Text style={styles.puce}>•</Text>
          <Text style={styles.texteListe}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

function LigneTable({ valeurs, largeurs, entete }) {
  return (
    <View style={[styles.ligneTable, entete && styles.enteteTable]}>
      {valeurs.map((valeur, index) => (
        <Text key={index} style={[entete ? styles.celluleEntete : styles.cellule, { flex: largeurs[index] }]}>
          {valeur ?? 'Non précisé'}
        </Text>
      ))}
    </View>
  )
}

function SectionPertinencePdf({ appelOffre }) {
  const couleurs = COULEURS_PERTINENCE[appelOffre.pertinence] ?? COULEURS_PERTINENCE.peu_pertinent

  return (
    <View style={styles.section}>
      <Text style={styles.titreSection}>1. Évaluation de la pertinence</Text>
      <Pilule texte={LIBELLES_PERTINENCE[appelOffre.pertinence]} couleurs={couleurs} />
      <Text style={styles.paragraphe}>{appelOffre.justification_pertinence}</Text>
      {appelOffre.points_attention?.length > 0 && (
        <>
          <Text style={styles.titreSousSection}>Points d'attention</Text>
          <Liste items={appelOffre.points_attention} />
        </>
      )}
    </View>
  )
}

function SectionResumePdf({ appelOffre }) {
  const resumeComplet = appelOffre.resume_complet ?? {}
  const datesCles = resumeComplet.dates_cles ?? {}
  const livrables = resumeComplet.livrables_attendus ?? []
  const criteres = resumeComplet.criteres_selection ?? []
  const exigences = resumeComplet.exigences_qualification ?? []
  const elementsLienMiyagi = resumeComplet.elements_lien_miyagi ?? []

  const infos = [
    ['Organisme', appelOffre.organisme],
    ['Titre / Objet', appelOffre.titre_objet],
    ['Numéro de référence', appelOffre.numero_reference],
    ['Budget estimé', appelOffre.budget_estime],
    ['Date limite de soumission', formaterDate(appelOffre.date_limite_soumission)],
    ['Publication', datesCles.publication],
    ['Début du mandat', datesCles.debut_mandat],
    ['Durée du mandat', datesCles.duree_mandat],
  ]

  return (
    <View style={styles.section}>
      <Text style={styles.titreSection}>2. Résumé de l'appel d'offres</Text>

      <View style={styles.table}>
        {infos.map(([label, valeur]) => (
          <LigneTable key={label} valeurs={[label, valeur]} largeurs={[0.4, 0.6]} />
        ))}
      </View>

      <Text style={styles.titreSousSection}>Description du mandat</Text>
      <Text style={styles.paragraphe}>{appelOffre.resume_mandat}</Text>

      {livrables.length > 0 && (
        <>
          <Text style={styles.titreSousSection}>Livrables attendus</Text>
          <Liste items={livrables} />
        </>
      )}

      {criteres.length > 0 && (
        <>
          <Text style={styles.titreSousSection}>Critères de sélection</Text>
          <View style={styles.table}>
            <LigneTable entete valeurs={['Critère', 'Pondération']} largeurs={[0.7, 0.3]} />
            {criteres.map((critere, index) => (
              <LigneTable key={index} valeurs={[critere.critere, critere.ponderation]} largeurs={[0.7, 0.3]} />
            ))}
          </View>
        </>
      )}

      {exigences.length > 0 && (
        <>
          <Text style={styles.titreSousSection}>Exigences de qualification</Text>
          <Liste items={exigences} />
        </>
      )}

      {elementsLienMiyagi.length > 0 && (
        <>
          <Text style={styles.titreSousSection}>Éléments en lien avec l'offre de Miyagi</Text>
          <View>
            {elementsLienMiyagi.map((element, index) => (
              <View key={index} style={styles.ligneListe}>
                <Text style={styles.puce}>•</Text>
                <Text style={styles.texteListe}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>{element.volet}</Text> — {element.description}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  )
}

function SectionClausesLegalesPdf({ appelOffre }) {
  const clauses = appelOffre.clauses_legales ?? []
  const largeurs = [1.3, 1.2, 2, 1.6, 0.9]

  return (
    <View style={styles.section}>
      <Text style={styles.titreSection}>3. Analyse des clauses légales</Text>

      {clauses.length > 0 ? (
        <View style={styles.table}>
          <LigneTable entete valeurs={['Clause', 'Référence', 'Résumé', 'Recommandation', 'Risque']} largeurs={largeurs} />
          {clauses.map((clause, index) => {
            const couleurs = COULEURS_RISQUE[clause.niveau_risque] ?? COULEURS_RISQUE.Modéré
            return (
              <View key={index} style={styles.ligneTable}>
                <Text style={[styles.cellule, { flex: largeurs[0] }]}>{clause.titre}</Text>
                <Text style={[styles.cellule, { flex: largeurs[1] }]}>{clause.reference_citation ?? 'Non précisé'}</Text>
                <Text style={[styles.cellule, { flex: largeurs[2] }]}>{clause.resume}</Text>
                <Text style={[styles.cellule, { flex: largeurs[3] }]}>{clause.recommandation ?? 'Non précisé'}</Text>
                <View style={[styles.cellule, { flex: largeurs[4] }]}>
                  <Pilule texte={clause.niveau_risque} couleurs={couleurs} style={{ marginBottom: 0 }} />
                </View>
              </View>
            )
          })}
        </View>
      ) : (
        <Text style={styles.paragraphe}>Aucune clause légale relevée.</Text>
      )}

      <Text style={styles.titreSousSection}>Résumé des risques légaux</Text>
      <Text style={styles.paragraphe}>{appelOffre.resume_risques_legaux}</Text>
    </View>
  )
}

function SectionRecommandationPdf({ appelOffre }) {
  return (
    <View style={styles.section}>
      <Text style={styles.titreSection}>4. Recommandation</Text>
      <View style={styles.encadreRecommandation}>
        <Text style={styles.paragraphe}>{appelOffre.recommandation}</Text>
      </View>
    </View>
  )
}

export default function AnalysePdfDocument({ appelOffre }) {
  const dateGeneration = new Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.separateurEntete}>
          <Text style={styles.enteteTitre}>{appelOffre.titre_objet ?? appelOffre.nom_fichier}</Text>
          {appelOffre.organisme && <Text style={styles.enteteSousTitre}>{appelOffre.organisme}</Text>}
          <Text style={styles.enteteMeta}>Document généré le {dateGeneration} — Préparé par Miyagi</Text>
        </View>

        <SectionPertinencePdf appelOffre={appelOffre} />
        <SectionResumePdf appelOffre={appelOffre} />
        <SectionClausesLegalesPdf appelOffre={appelOffre} />
        <SectionRecommandationPdf appelOffre={appelOffre} />
      </Page>
    </Document>
  )
}
