// Edge Function "analyze-rfp" — Projet DOJO, MVP Phase 1
//
// Reçoit { appel_offre_id }, télécharge le PDF associé depuis Supabase Storage,
// l'envoie à l'API Anthropic (document natif, pas d'extraction de texte) avec
// tool use forcé pour obtenir une analyse structurée fiable, puis écrit le
// résultat dans la table appels_offres.
//
// Appelée avec le JWT de l'utilisateur (jamais la service role) afin que les
// policies RLS s'appliquent. Secret requis : ANTHROPIC_API_KEY
// (supabase secrets set ANTHROPIC_API_KEY=...).

import { createClient } from 'jsr:@supabase/supabase-js@2'
import Anthropic from 'npm:@anthropic-ai/sdk@0.32'
import { SYSTEM_PROMPT, ANALYSE_TOOL } from './prompt.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
// À vérifier au moment du déploiement : l'identifiant de modèle courant peut évoluer.
const CLAUDE_MODEL = 'claude-sonnet-4-6'

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

// Appelée depuis le frontend web (origine différente) : le navigateur envoie une
// requête preflight OPTIONS avant le POST réel, qui doit recevoir ces en-têtes
// pour ne pas être bloquée par CORS. Sans ça, le préflight échoue silencieusement
// côté navigateur (la requête réelle n'est jamais envoyée).
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
    .select('id, storage_path')
    .eq('id', appelOffreId)
    .single()

  if (fetchError || !appelOffre) {
    return new Response(
      JSON.stringify({ error: "Appel d'offres introuvable ou accès refusé" }),
      { status: 404, headers: CORS_HEADERS },
    )
  }

  await supabase
    .from('appels_offres')
    .update({ statut: 'analyse_en_cours', erreur_message: null })
    .eq('id', appelOffreId)

  try {
    const { data: fichier, error: downloadError } = await supabase
      .storage
      .from('appels-offres')
      .download(appelOffre.storage_path)

    if (downloadError || !fichier) {
      throw new Error(`Téléchargement du fichier impossible : ${downloadError?.message ?? 'inconnu'}`)
    }

    const pdfBase64 = encodeBase64(new Uint8Array(await fichier.arrayBuffer()))

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      // L'analyse exhaustive des 13 catégories de clauses légales (5 champs chacune)
      // dépasse régulièrement 4096 tokens en sortie ; coupait l'analyse en cours de génération.
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      tools: [ANALYSE_TOOL],
      tool_choice: { type: 'tool', name: ANALYSE_TOOL.name },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
            },
            {
              type: 'text',
              text: "Analyse ce document d'appel d'offres et enregistre ton analyse avec l'outil fourni.",
            },
          ],
        },
      ],
    })

    if (message.stop_reason === 'max_tokens') {
      throw new Error(
        "L'analyse a été interrompue avant la fin (limite de tokens atteinte) : le document est probablement trop volumineux ou complexe, réessaie",
      )
    }

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    )
    if (!toolUse) {
      throw new Error("Claude n'a pas retourné d'analyse structurée")
    }

    const analyse = toolUse.input as Record<string, unknown>
    const resumeComplet = (analyse.resume_complet ?? {}) as Record<string, unknown>
    const datesCles = (resumeComplet.dates_cles ?? {}) as Record<string, unknown>
    const dateLimiteSoumission = parseDateIso(datesCles.date_limite_iso)

    const { error: updateError } = await supabase
      .from('appels_offres')
      .update({
        statut: 'analyse_terminee',
        pertinence: analyse.pertinence,
        justification_pertinence: analyse.justification_pertinence,
        points_attention: analyse.points_attention,
        organisme: analyse.organisme,
        titre_objet: analyse.titre_objet,
        numero_reference: analyse.numero_reference,
        budget_estime: analyse.budget_estime,
        resume_mandat: analyse.resume_mandat,
        resume_complet: resumeComplet,
        date_limite_soumission: dateLimiteSoumission,
        clauses_legales: analyse.clauses_legales,
        resume_risques_legaux: analyse.resume_risques_legaux,
        recommandation: analyse.recommandation,
      })
      .eq('id', appelOffreId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ ok: true, appel_offre_id: appelOffreId }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const messageErreur = error instanceof Error ? error.message : 'Erreur inconnue'

    await supabase
      .from('appels_offres')
      .update({ statut: 'erreur', erreur_message: messageErreur })
      .eq('id', appelOffreId)

    return new Response(JSON.stringify({ error: messageErreur }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})

function parseDateIso(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
