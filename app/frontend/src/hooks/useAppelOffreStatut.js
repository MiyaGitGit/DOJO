import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const STATUTS_TERMINAUX = ['analyse_terminee', 'erreur']
const INTERVALLE_POLLING_MS = 4000

export function useAppelOffreStatut(id) {
  const [appelOffre, setAppelOffre] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    let intervalId
    let annule = false

    async function charger() {
      const { data, error } = await supabase.from('appels_offres').select('*').eq('id', id).single()

      if (annule) return

      if (error) {
        setErreur("Impossible de charger cet appel d'offres : " + error.message)
        setChargement(false)
        return
      }

      setAppelOffre(data)
      setChargement(false)

      if (STATUTS_TERMINAUX.includes(data.statut) && intervalId) {
        clearInterval(intervalId)
      }
    }

    charger()
    intervalId = setInterval(charger, INTERVALLE_POLLING_MS)

    return () => {
      annule = true
      clearInterval(intervalId)
    }
  }, [id])

  return { appelOffre, chargement, erreur }
}
