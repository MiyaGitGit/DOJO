import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const STATUTS_TERMINAUX = ['analyse_terminee', 'erreur']
const INTERVALLE_POLLING_MS = 4000

export function useAppelOffreStatut(id) {
  const [appelOffre, setAppelOffre] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  const charger = useCallback(async () => {
    const { data, error } = await supabase.from('appels_offres').select('*').eq('id', id).single()

    if (error) {
      setErreur("Impossible de charger cet appel d'offres : " + error.message)
      setChargement(false)
      return null
    }

    setAppelOffre(data)
    setChargement(false)
    return data
  }, [id])

  useEffect(() => {
    charger()
  }, [charger])

  // Le polling suit le statut : il reprend dès qu'une relance repasse l'AO en cours d'analyse.
  const enCours = appelOffre !== null && !STATUTS_TERMINAUX.includes(appelOffre.statut)

  useEffect(() => {
    if (!enCours) return
    const intervalId = setInterval(charger, INTERVALLE_POLLING_MS)
    return () => clearInterval(intervalId)
  }, [enCours, charger])

  return { appelOffre, chargement, erreur, refetch: charger }
}
