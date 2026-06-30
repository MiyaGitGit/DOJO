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
    let intervalId
    let annule = false

    async function poll() {
      const data = await charger()
      if (annule || !data) return

      if (STATUTS_TERMINAUX.includes(data.statut) && intervalId) {
        clearInterval(intervalId)
      }
    }

    poll()
    intervalId = setInterval(poll, INTERVALLE_POLLING_MS)

    return () => {
      annule = true
      clearInterval(intervalId)
    }
  }, [id, charger])

  return { appelOffre, chargement, erreur, refetch: charger }
}
