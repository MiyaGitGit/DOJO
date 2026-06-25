import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAppelsOffres() {
  const [appelsOffres, setAppelsOffres] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  const charger = useCallback(async () => {
    setChargement(true)
    const { data, error } = await supabase
      .from('appels_offres')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setErreur("Impossible de charger l'historique : " + error.message)
    } else {
      setAppelsOffres(data)
    }
    setChargement(false)
  }, [])

  useEffect(() => {
    charger()
  }, [charger])

  return { appelsOffres, chargement, erreur, refetch: charger }
}
