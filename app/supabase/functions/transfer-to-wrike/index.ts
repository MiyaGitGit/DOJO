// Edge Function "transfer-to-wrike" — Projet DOJO, Phase 2
//
// Reçoit { appel_offre_id } et doit créer le projet correspondant dans Wrike, à
// partir du Folder Blueprint Wrike déjà utilisé pour les AO (voir la présentation
// "2026-06-29_presentation-claude-code-vs-dojo.pptx", slides 8-9, pour l'analyse
// qui a mené à ce choix plutôt qu'au remplissage automatisé du formulaire web
// Miyagi : l'API Wrike évite le blocage du reCAPTCHA du formulaire et réutilise
// l'infrastructure déjà en place pour analyze-rfp).
//
// Déclenchement strictement manuel : un humain doit avoir lu l'analyse de l'AO
// (statut = analyse_terminee) et cliqué le bouton "Transférer vers Wrike" sur la
// page de détail. Cette fonction ne décide jamais elle-même qu'un AO est pertinent,
// et refuse tout appel sur un AO dont l'analyse n'est pas terminée.
//
// Secrets requis (pas encore configurés au moment de l'écriture de cette fonction,
// voir context/CONTEXT.md du dépôt DOJO pour le suivi) :
// - WRIKE_API_TOKEN : token API Wrike. Un admin Wrike ne peut générer un token que
//   pour lui-même (pas de délégation) — accès à demander à Martine Tessier.
// - WRIKE_BLUEPRINT_ID : identifiant du Folder Blueprint Wrike utilisé pour les AO,
//   récupérable via GET /folder_blueprints une fois le token obtenu.
//
// TANT QUE CES DEUX SECRETS NE SONT PAS CONFIGURÉS, cette fonction se contente de
// renvoyer une erreur claire et de marquer wrike_statut = 'erreur' — elle ne tente
// aucun appel à l'API Wrike.
//
// TODO une fois les secrets configurés et le mapping des champs personnalisés
// Wrike connu (voir Espace Admin Wrike → Champs personnalisés du Blueprint AO) :
// 1. POST /folder_blueprints/{WRIKE_BLUEPRINT_ID}/launch_async avec title + parent
//    pour créer le projet (l'appel est asynchrone, renvoie un Job ID).
// 2. Suivre le Job jusqu'à obtenir l'ID du dossier/projet créé.
// 3. PUT sur ce dossier pour écrire les champs personnalisés (organisme,
//    numero_reference, type d'AO, dates clés, etc.) — l'endpoint launch_async ne
//    prend en paramètre que title et parent, pas les champs personnalisés.
// 4. Mettre à jour wrike_statut = 'transfere' et wrike_url avec le permalink Wrike.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const WRIKE_API_TOKEN = Deno.env.get('WRIKE_API_TOKEN')
const WRIKE_BLUEPRINT_ID = Deno.env.get('WRIKE_BLUEPRINT_ID')

// Appelée depuis le frontend web (origine différente) : le navigateur envoie une
// requête preflight OPTIONS avant le POST réel, qui doit recevoir ces en-têtes
// pour ne pas être bloquée par CORS.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
      status: 405,
      headers: CORS_HEADERS,
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'En-tête Authorization manquant' }), {
      status: 401,
      headers: CORS_HEADERS,
    })
  }

  // Client lié au JWT de l'appelant : les policies RLS s'appliquent normalement.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  let appelOffreId: string
  try {
    const body = await req.json()
    if (!body.appel_offre_id || typeof body.appel_offre_id !== 'string') {
      throw new Error('appel_offre_id manquant ou invalide')
    }
    appelOffreId = body.appel_offre_id
  } catch {
    return new Response(
      JSON.stringify({ error: 'Payload invalide, attendu { appel_offre_id: string }' }),
      { status: 400, headers: CORS_HEADERS },
    )
  }

  const { data: appelOffre, error: fetchError } = await supabase
    .from('appels_offres')
    .select('id, statut, wrike_statut')
    .eq('id', appelOffreId)
    .single()

  if (fetchError || !appelOffre) {
    return new Response(
      JSON.stringify({ error: "Appel d'offres introuvable ou accès refusé" }),
      { status: 404, headers: CORS_HEADERS },
    )
  }

  if (appelOffre.statut !== 'analyse_terminee') {
    return new Response(
      JSON.stringify({
        error: "L'analyse de cet appel d'offres doit être terminée avant de le transférer vers Wrike",
      }),
      { status: 409, headers: CORS_HEADERS },
    )
  }

  if (appelOffre.wrike_statut === 'transfere') {
    return new Response(
      JSON.stringify({ error: "Cet appel d'offres a déjà été transféré vers Wrike" }),
      { status: 409, headers: CORS_HEADERS },
    )
  }

  await supabase
    .from('appels_offres')
    .update({ wrike_statut: 'transfert_en_cours', wrike_erreur_message: null })
    .eq('id', appelOffreId)

  if (!WRIKE_API_TOKEN || !WRIKE_BLUEPRINT_ID) {
    const secretsManquants = [
      !WRIKE_API_TOKEN && 'WRIKE_API_TOKEN',
      !WRIKE_BLUEPRINT_ID && 'WRIKE_BLUEPRINT_ID',
    ].filter(Boolean)

    const messageErreur =
      `Le transfert vers Wrike n'est pas encore configuré : il manque ${secretsManquants.join(' et ')} ` +
      "(supabase secrets set ...). Voir Martine Tessier pour l'accès Wrike."

    await supabase
      .from('appels_offres')
      .update({ wrike_statut: 'erreur', wrike_erreur_message: messageErreur })
      .eq('id', appelOffreId)

    return new Response(JSON.stringify({ error: messageErreur }), {
      status: 501,
      headers: CORS_HEADERS,
    })
  }

  // Les deux secrets sont configurés, mais l'appel réel à l'API Wrike
  // (launch_async + mapping des champs personnalisés) reste à écrire — voir le
  // TODO en haut de ce fichier.
  const messageErreur =
    "Secrets Wrike détectés, mais l'appel à l'API Wrike n'est pas encore implémenté " +
    '(voir TODO dans transfer-to-wrike/index.ts)'

  await supabase
    .from('appels_offres')
    .update({ wrike_statut: 'erreur', wrike_erreur_message: messageErreur })
    .eq('id', appelOffreId)

  return new Response(JSON.stringify({ error: messageErreur }), {
    status: 501,
    headers: CORS_HEADERS,
  })
})
