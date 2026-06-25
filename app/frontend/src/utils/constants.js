export const LIBELLES_STATUT = {
  en_attente: 'En attente',
  analyse_en_cours: 'Analyse en cours',
  analyse_terminee: 'Terminée',
  erreur: 'Erreur',
}

export const COULEURS_STATUT = {
  en_attente: { fond: '#f4f2f1', texte: '#544341' },
  analyse_en_cours: { fond: '#fff1d6', texte: '#ff7300' },
  analyse_terminee: { fond: '#e3f3ea', texte: '#2e9e5b' },
  erreur: { fond: '#fbeaea', texte: '#c0392b' },
}

export const LIBELLES_PERTINENCE = {
  tres_pertinent: 'Très pertinent',
  pertinent: 'Pertinent',
  peu_pertinent: 'Peu pertinent',
  non_pertinent: 'Non pertinent',
}

export const COULEURS_PERTINENCE = {
  tres_pertinent: { fond: '#e3f3ea', texte: '#2e9e5b' },
  pertinent: { fond: '#fff1d6', texte: '#ff7300' },
  peu_pertinent: { fond: '#f4f2f1', texte: '#9b9492' },
  non_pertinent: { fond: '#f4f2f1', texte: '#9b9492' },
}

export const COULEURS_RISQUE = {
  Faible: { fond: '#e3f3ea', texte: '#2e9e5b' },
  Modéré: { fond: '#fff1d6', texte: '#ff7300' },
  Élevé: { fond: '#fbeaea', texte: '#c0392b' },
}

export const OPTIONS_FILTRE_PERTINENCE = [
  { valeur: 'toutes', libelle: 'Toutes les pertinences' },
  { valeur: 'tres_pertinent', libelle: LIBELLES_PERTINENCE.tres_pertinent },
  { valeur: 'pertinent', libelle: LIBELLES_PERTINENCE.pertinent },
  { valeur: 'peu_pertinent', libelle: LIBELLES_PERTINENCE.peu_pertinent },
  { valeur: 'non_pertinent', libelle: LIBELLES_PERTINENCE.non_pertinent },
]
