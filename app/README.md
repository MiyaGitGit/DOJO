# DOJO — Analyse d'appels d'offres (MVP Phase 1)

Application web qui digitalise la Phase 1 du Projet DOJO : dépôt d'un appel d'offres (AO) public en PDF, analyse automatique par Claude (pertinence pour Miyagi, résumé, clauses légales, recommandation), et historique consultable dans un tableau de bord.

Remplace l'usage actuel de la skill Claude Code `analyze-rfp` (sans persistance, usage CLI/chat ponctuel) par une vraie application avec base de données.

## Architecture

```
Frontend React (Vite, généré via Claude.ai canvas)
        │  supabase-js (auth + DB + storage)
        ▼
Supabase (Postgres + Auth + Storage)
        │  upload PDF → insert ligne → invoke()
        ▼
Edge Function "analyze-rfp" (Deno/TypeScript)
        │  PDF envoyé nativement à l'API Anthropic, tool use forcé
        ▼
Claude API → JSON structuré → écriture Postgres
```

Périmètre volontairement limité aux fichiers **PDF** (majorité des AO publics). Le `.docx` pourra être ajouté en V2 (nécessiterait une extraction de texte côté Edge Function, Claude ne lit pas nativement le `.docx`).

## Structure du dossier

```
2026-06-18_dojo-analyse-ao/
├── README.md                      # ce fichier
├── prompt-claude-design.md        # à coller dans Claude.ai pour générer le frontend
├── supabase/
│   ├── migrations/0001_init.sql   # schéma de la base de données
│   └── functions/analyze-rfp/
│       ├── index.ts               # logique de la fonction
│       └── prompt.ts              # prompt système + schéma du tool d'analyse
└── frontend/                      # à ajouter une fois le frontend généré par Claude.ai
```

## Schéma de la base de données

Table unique `appels_offres` (voir `supabase/migrations/0001_init.sql` pour le détail complet) :

- Suivi : `statut` (`en_attente` / `analyse_en_cours` / `analyse_terminee` / `erreur`), `erreur_message`
- Fichier : `nom_fichier`, `storage_path` (bucket Storage `appels-offres`)
- Section 1 (pertinence) : `pertinence`, `justification_pertinence`, `points_attention`
- Section 2 (résumé) : `organisme`, `titre_objet`, `numero_reference`, `date_limite_soumission`, `budget_estime`, `resume_mandat`, `resume_complet` (jsonb)
- Section 3 (légal) : `clauses_legales` (jsonb), `resume_risques_legaux`
- Section 4 (recommandation) : `recommandation`

RLS activée : chaque ligne et chaque fichier du bucket Storage n'est visible/modifiable que par son propriétaire (`auth.uid() = cree_par`). Prêt pour un usage multi-utilisateurs futur sans changement de schéma.

## Mise en place (sans CLI, via le Dashboard Supabase)

### 1. Créer le projet Supabase

Créer un nouveau projet sur [supabase.com](https://supabase.com) (ou réutiliser un projet existant).

### 2. Exécuter la migration SQL

Dans le Dashboard Supabase → **SQL Editor**, coller l'intégralité du contenu de `supabase/migrations/0001_init.sql` et exécuter. Cela crée la table, les policies RLS, le trigger et le bucket Storage.

### 3. Créer le compte utilisateur

Dashboard → **Authentication → Users → Add user**, créer manuellement le compte de Julien (email + mot de passe). Aucune page d'inscription n'existe dans l'application : c'est intentionnel, l'accès est limité à ce compte.

### 4. Configurer le secret Anthropic

Dashboard → **Edge Functions → Secrets** (ou via CLI si Julien l'installe plus tard : `supabase secrets set ANTHROPIC_API_KEY=...`). Utiliser une clé API Anthropic personnelle pour ce prototype.

### 5. Déployer l'Edge Function

Dashboard → **Edge Functions → Create a new function**, nommer `analyze-rfp`, coller le contenu de `index.ts` et `prompt.ts` (les deux fichiers du dossier `supabase/functions/analyze-rfp/`). Si la CLI Supabase est installée plus tard, `supabase functions deploy analyze-rfp` fonctionne aussi directement depuis ce dossier.

### 6. Générer le frontend

Coller le contenu de `prompt-claude-design.md` dans Claude.ai (canvas/artifacts). Une fois le code généré, le déposer dans un sous-dossier `frontend/` de ce projet.

### 7. Configurer et lancer le frontend

```
cd frontend
npm install
```

Créer un fichier `.env` à partir de `.env.example`, avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (visibles dans Dashboard → Project Settings → API).

```
npm run dev
```

Tester le flux complet : connexion → upload d'un AO réel → attente de l'analyse → consultation du détail.

### 8. Déploiement

Déployer le dossier `frontend/` sur Vercel (ou équivalent), avec les mêmes variables d'environnement configurées dans les paramètres du projet de déploiement.

## Migration future vers DANIELSAN (instance Claude Code Miyagi)

Rien à faire maintenant, mais à garder en tête si Miyagi approuve le projet et veut le rapatrier sur son infrastructure :

- **Code** : simple copie du dossier vers l'ordinateur Miyagi (ou push vers un dépôt Git partagé). Aucune réécriture nécessaire.
- **Base de données Supabase** : le projet n'est jamais "sur l'ordinateur" de Julien, il est déjà dans le cloud Supabase. Migrer signifie soit transférer la propriété du projet existant à un compte/organisation Miyagi, soit créer un nouveau projet Supabase sous un compte Miyagi et copier les données (export/import standard, pas une reconstruction).
- **Fichiers (PDF, rapports)** : stockés dans Supabase Storage pour ce MVP. Si Miyagi préfère les voir dans son Drive plus tard, ça reste une fonctionnalité additionnelle qu'on peut greffer après coup (copier les fichiers, ou faire pousser une copie de chaque rapport vers un dossier Drive Miyagi), sans toucher au reste du système.
- **Clé API Anthropic** : remplacer la clé personnelle de Julien par une clé Miyagi, indépendamment de toute migration (bonne pratique de toute façon dès qu'un outil passe en usage professionnel).
- **Bibliothèque de documents Miyagi (Phase 3 future, hors scope MVP)** : cette bibliothèque (profils, projets similaires, CV des consultants) vit déjà dans le Drive Miyagi. Au moment de construire la Phase 3 (rédaction assistée des réponses), la connexion directe à ce Drive plutôt que la duplication des documents dans Supabase sera probablement le bon choix. À trancher à ce moment, pas maintenant.

## Suite du projet (au-delà de ce MVP)

- **Phase 2 (en cours)** : connexion au formulaire Miyagi — transfert des données de l'AO vers Wrike, déclenché manuellement par un humain après lecture de l'analyse (bouton "Transférer vers Wrike" sur le dashboard et la page de détail). Le code est en place (`supabase/migrations/0002_wrike_transfer.sql`, `supabase/functions/transfer-to-wrike/`), mais l'appel réel à l'API Wrike attend des prérequis côté Miyagi : token API, ID du Blueprint AO, mapping des champs personnalisés (à obtenir via Martine Tessier).
- **Phase 3** : génération assistée d'une ébauche de réponse pour 100% des AO transférés dans Wrike
- **Phase 4** : génération automatique d'offres de services à partir de l'analyse des rapports issus du formulaire client et du profil du client
