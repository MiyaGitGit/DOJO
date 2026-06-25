const formateur = new Intl.DateTimeFormat('fr-CA', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export function formaterDate(valeur) {
  if (!valeur) return 'Non précisé'
  const date = new Date(valeur)
  if (Number.isNaN(date.getTime())) return 'Non précisé'
  return formateur.format(date)
}
