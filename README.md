# DOJO

Automatisation de l'analyse des appels d'offres (AO) publics pour [Miyagi Inc.](https://miyagi.ca) :
évaluation de la pertinence, résumé, analyse des clauses légales et recommandation, avec
historique consultable.

## Contenu de ce dépôt

| Dossier | Contenu |
|---|---|
| [`app/`](app/) | MVP Phase 1 — application web (frontend + Supabase + Edge Function Claude). Voir [`app/README.md`](app/README.md) pour l'architecture et la mise en place. |
| [`plugins/miyagi/`](plugins/miyagi/) | Plugin Claude Code (skills `analyze-rfp` et `docx`) installable comme marketplace local. |
| [`presentation/`](presentation/) | Présentation de lancement du projet. |

## Statut

MVP Phase 1 en développement, porté par Julien (Miyagi) avec Claude Code. Voir
[`CLAUDE.md`](CLAUDE.md) pour le contexte complet, le statut détaillé et le plan de migration vers
l'instance Claude Code dédiée de Miyagi (DANIELSAN).
