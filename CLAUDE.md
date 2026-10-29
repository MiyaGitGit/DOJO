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

Feuille de route en versions (DOJO v1, v2, v3), présentée à l'Équipe IA de Miyagi le 2026-10-28
(source : plan du programme Projets IA, version d'équipe du 2026-10-26). Projet classé priorité
haute ; responsable : Julien ; contributeurs : Pascale, Kim Lascelles.

**DOJO v1 (en production)** : une application web (Supabase + Edge Function Claude) qui
digitalise l'analyse d'un AO déposé en PDF — pertinence, résumé, clauses légales, recommandation —
avec historique consultable. Voir [`app/README.md`](app/README.md) pour l'architecture technique et
la mise en place.

**DOJO v2** : rédaction d'ébauches d'offres de services (ODS) et de réponses aux AO. Analyse la
transcription d'un appel de prise de besoin (ou un document d'AO) et rédige une ébauche d'ODS (ou
de réponse à l'AO). Sources : transcription d'appel, en plus du formulaire Miyagi et du profil
client ; bibliothèque de documents Miyagi (profils, projets similaires, CV des consultants) dans
le Drive Miyagi.

**DOJO v3** : portail des demandes de formation. Collecter, centraliser et traiter les demandes
de formation et les documents de contenus, analyser les besoins, générer automatiquement des
chartes, devis sommaires et estimations d'efforts. D'abord pour les employés et gestionnaires de
Miyagi (interne), puis éventuellement pour des clients externes ; à terme, offre envisagée en mode
SaaS.

Jalons (2026-2027, « S2 » = 2e semaine du mois) :

| Jalon | Livrable |
|---|---|
| Novembre 2026, S2 | Portée et stratégie de développement |
| Novembre 2026, S4 | Présentation de l'architecture (flux) |
| Décembre 2026, S4 | Prototype DOJO v2 |
| Janvier 2027, S4 | Déploiement DOJO v2 ; stratégie DOJO v3 |
| Février 2027, S4 | Prototype DOJO v3 |
| Mars 2027, S4 | Déploiement DOJO v3 |

**Transfert vers Wrike (dépriorisé)** : transfert manuel des données de l'AO vers Wrike, déclenché
par un humain après lecture de l'analyse (bouton "Transférer vers Wrike"). Le code est en place
(`app/supabase/migrations/0002_wrike_transfer.sql`, `app/supabase/functions/transfer-to-wrike/`,
désignés « Phase 2 » dans les commentaires du code, selon l'ancienne numérotation), mais jamais
configuré : il attend un token API, l'ID du Blueprint AO et le mapping des champs personnalisés.
Absent de la feuille de route actuelle.

*Note de cohérence : l'ancienne feuille de route comptait 4 phases (1 analyse des AO, 2 transfert
Wrike, 3 ébauches de réponses aux AO, 4 offres de services). Les phases 3 et 4 sont regroupées dans
DOJO v2. L'idée d'automatiser le déclencheur de transfert vers Wrike (sans relecture humaine)
reste écartée, conformément à la décision du 2026-06-18 de conserver le déclenchement manuel.*

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
