# CLAUDE.md

Ce fichier guide Claude Code dans ce workspace.

---

## Ce qu'est ce projet

DOJO est le chantier d'automatisation de l'analyse des appels d'offres (AO) publics pour
**Miyagi Inc.**, porté par Julien (concepteur pédagogique chez Miyagi). L'objectif à terme :

- Analyser automatiquement les AO publics pour évaluer leur pertinence pour Miyagi
- Relever et contextualiser les clauses légales à risque
- Rédiger des réponses aux AO en s'appuyant sur la bibliothèque de documents Miyagi
- Générer des offres de services à partir des réponses au formulaire Miyagi et du profil client

## Statut actuel

**MVP Phase 1** : une application web (Supabase + Edge Function Claude) qui digitalise l'analyse
d'un AO déposé en PDF — pertinence, résumé, clauses légales, recommandation — avec historique
consultable. Voir [`app/README.md`](app/README.md) pour l'architecture technique et la mise en
place.

Phases futures (hors scope du MVP) :
- **Phase 2** : déclencheur automatisé de transfert vers Wrike pour les AO très pertinents
- **Phase 3** : génération assistée d'une ébauche de réponse, connectée à la bibliothèque de
  documents Miyagi (profils, projets similaires, CV des consultants) déjà présente dans le Drive
  Miyagi

## Origine et migration prévue vers DANIELSAN

Ce projet a été initié et développé par Julien dans son workspace personnel d'apprentissage IA
(TARS), puis consolidé ici en juin 2026 dans un dépôt dédié et indépendant — geste anticipant la
migration à venir.

**Migration prévue :** quand Julien obtiendra l'aval de la direction de Miyagi, ce dépôt sera
transféré vers une instance Claude Code appartenant à Miyagi, nommée **DANIELSAN** (masculin).
Miyagi devra souscrire à Claude Pro et fournir un ordinateur dédié. DANIELSAN pilotera alors le
projet DOJO en production. Comme ce dépôt est déjà autonome (rien à extraire d'ailleurs), le
transfert devrait se limiter à : copier ce dossier (ou pousser vers un dépôt Git partagé Miyagi),
transférer la propriété du projet Supabase (ou migrer les données), et remplacer la clé API
Anthropic personnelle de Julien par une clé Miyagi.

## Structure du dossier

```
.
├── app/                          # MVP Phase 1 (frontend + Supabase + Edge Function)
│   └── README.md                 # Architecture technique, mise en place, prochaines phases
├── plugins/miyagi/                # Plugin Claude Code (marketplace local)
│   └── skills/
│       ├── analyze-rfp/SKILL.md  # Analyse d'un AO (pertinence, résumé, clauses légales, recommandation)
│       │   └── savoir-faire-elearning-miyagi.md  # Référence : capacités techniques elearning réelles (synthèse de l'historique Chat "Mission accomplie")
│       └── docx/SKILL.md         # Export Word (.docx) d'un contenu structuré, généré en XML pur (pas de COM/Word)
├── .claude-plugin/marketplace.json
└── presentation/                  # Présentation de lancement du projet
```

## Comment travailler ici

- Toujours rédiger en **français**
- Ce dépôt est le **point de vérité unique** pour DOJO — ne pas dupliquer son contenu ailleurs
  (notamment pas dans TARS, qui ne garde qu'un pointeur vers ici)
- Le skill `docx` génère les `.docx` directement en XML (zip), jamais via l'automatisation COM de
  Word (instable, voir la section « Pourquoi pas Word/COM » dans `plugins/miyagi/skills/docx/SKILL.md`)
- Avant de committer un secret (clé API, `.env`), vérifier le `.gitignore`
