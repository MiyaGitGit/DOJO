# Prompt Claude Design — Application DOJO (analyse d'appels d'offres pour Miyagi)

> Copier-coller ce prompt dans Claude.ai (canvas/artifacts) pour générer le frontend React de l'application.

---

Crée une application web React (Vite) en français pour Julien Larose, qui l'utilise seul pour centraliser l'analyse automatique des appels d'offres (AO) publics pertinents pour Miyagi Inc. L'application se connecte à un projet Supabase déjà configuré (base de données, authentification, stockage de fichiers et fonction d'analyse IA sont déjà en place côté serveur).

## Contexte

Miyagi est une firme de consultation (gestion du changement, formation, transformation numérique, implantations ERP). Julien fait la vigie des appels d'offres publics. Cette application remplace un processus manuel : il dépose le PDF d'un AO, l'IA l'analyse automatiquement (pertinence pour Miyagi, résumé, clauses légales, recommandation), et le résultat est conservé dans un tableau de bord consultable. Ton sobre, professionnel, pas de fioritures inutiles — c'est un outil de travail quotidien, pas une vitrine marketing.

## Identité visuelle Miyagi (à respecter strictement)

### Couleurs
- Fond principal : blanc `#FFFFFF`
- Couleur accent principale : Orange `#F9AE00`
- Couleur accent secondaire : Orange `#FF7300`
- Dégradé principal : `#F9AE00` vers `#FF7300` (boutons d'action principaux)
- Texte principal : Marron `#544341`
- Section sombre / barre de navigation : fond marron `#544341`, texte blanc
- Couleurs de statut : succès/vert pour "Très pertinent", orange pour "Pertinent", gris pour "Peu pertinent" et "Non pertinent" ; risque légal : vert (Faible), orange (Modéré), rouge (Élevé)

### Typographie
- Police : Poppins (Google Fonts, weights 400/500/600/700)

### Style graphique
- Formes très arrondies (capsules/pilules) pour les badges de statut, boutons, numéros — c'est la signature visuelle Miyagi
- Layout aéré, beaucoup d'espace blanc, sections bien délimitées
- Style sobre et professionnel, pas d'ombres excessives

## Stack technique imposée

- React + Vite (pas de Next.js, pas besoin de SSR pour cet usage)
- `@supabase/supabase-js` pour toute l'interaction avec le backend (auth, base de données, stockage, fonctions)
- Variables d'environnement : `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (jamais d'autre clé, jamais de clé Anthropic ou de service role dans le code frontend)
- CSS natif (pas de Tailwind, pas de Bootstrap), variables CSS pour les couleurs, cohérent avec le reste de l'identité Miyagi
- React Router pour la navigation entre les 3 écrans
- `react-dropzone` ou simple input file natif pour l'upload (au choix, garder simple)

## Schéma de la base de données (déjà créé côté Supabase, à respecter exactement)

Table `appels_offres` :

```
id                        uuid (clé primaire)
created_at                timestamptz
updated_at                timestamptz
cree_par                  uuid (id de l'utilisateur connecté)
nom_fichier               text
storage_path              text
statut                    text  -- 'en_attente' | 'analyse_en_cours' | 'analyse_terminee' | 'erreur'
erreur_message            text | null
pertinence                text | null  -- 'tres_pertinent' | 'pertinent' | 'peu_pertinent' | 'non_pertinent'
justification_pertinence  text | null
points_attention          jsonb | null  -- tableau de chaînes
organisme                 text | null
titre_objet                text | null
numero_reference          text | null
date_limite_soumission    timestamptz | null
budget_estime             text | null
resume_mandat             text | null
resume_complet            jsonb | null  -- { dates_cles: {publication, date_limite, debut_mandat, duree_mandat}, livrables_attendus: string[], criteres_selection: [{critere, ponderation}], exigences_qualification: string[], elements_lien_miyagi: [{volet, description}] }
clauses_legales           jsonb | null  -- tableau de { titre, resume, niveau_risque: 'Faible'|'Modéré'|'Élevé' }
resume_risques_legaux     text | null
recommandation            text | null
```

Bucket Storage : `appels-offres` (privé). Convention de chemin obligatoire pour l'upload : `{id_utilisateur}/{uuid}-{nom_fichier_original}`.

Fonction Supabase (Edge Function) déjà déployée : `analyze-rfp`, invoquée via `supabase.functions.invoke('analyze-rfp', { body: { appel_offre_id } })`. Elle met à jour la ligne en base de manière asynchrone (le frontend doit donc réagir au changement de `statut`, pas attendre une réponse complète de l'invocation).

## Authentification

- Écran de connexion simple : email + mot de passe, bouton "Se connecter"
- Utilise `supabase.auth.signInWithPassword({ email, password })`
- **Aucun formulaire d'inscription** : un seul compte existe déjà, créé manuellement par l'administrateur
- Si non connecté, rediriger vers l'écran de connexion (protège toutes les routes de l'application)
- Bouton de déconnexion visible dans la barre de navigation (`supabase.auth.signOut()`)

## Écrans requis

### 1. Upload d'un AO

- Zone de dépôt de fichier (drag & drop + bouton "Choisir un fichier"), accepte uniquement les `.pdf`
- Au dépôt :
  1. Upload du fichier vers `supabase.storage.from('appels-offres').upload(chemin, fichier)` avec le chemin `{user.id}/{uuid()}-{nom_fichier}`
  2. Insertion d'une ligne dans `appels_offres` (`nom_fichier`, `storage_path`, `statut: 'en_attente'`, `cree_par: user.id`)
  3. Appel de `supabase.functions.invoke('analyze-rfp', { body: { appel_offre_id: <id de la ligne créée> } })`
  4. Redirection vers l'écran de détail de cet AO, qui affichera l'état de chargement
- Afficher une erreur claire si l'upload échoue ou si le fichier n'est pas un PDF

### 2. Dashboard / historique

- Liste de tous les AO de l'utilisateur, triée par défaut par `created_at` décroissant
- Pour chaque AO : nom du fichier, organisme, titre, badge de statut (en attente / analyse en cours avec indicateur de chargement / terminée / erreur), badge de pertinence coloré (une fois l'analyse terminée), date limite de soumission
- Filtre par pertinence et tri par date limite de soumission
- Clic sur une ligne → écran de détail
- Bouton "Nouvel AO" menant à l'écran d'upload
- **État vide** : si aucun AO n'a encore été analysé, afficher un message clair invitant à déposer un premier AO (pas un tableau vide silencieux)

### 3. Détail d'une analyse

- Si `statut` est `en_attente` ou `analyse_en_cours` : afficher un indicateur de chargement avec un message ("Analyse en cours, ceci peut prendre une minute"), et rafraîchir périodiquement (polling toutes les 3-5 secondes, ou Supabase Realtime si plus simple à générer) jusqu'à ce que le statut change
- Si `statut` est `erreur` : afficher le message d'erreur (`erreur_message`) et un bouton "Réessayer l'analyse" qui rappelle la fonction `analyze-rfp`
- Si `statut` est `analyse_terminee`, afficher les 4 sections :
  1. **Pertinence** : badge coloré selon `pertinence`, `justification_pertinence`, liste des `points_attention`
  2. **Résumé** : `organisme`, `titre_objet`, `numero_reference`, `budget_estime`, `resume_mandat`, dates clés, livrables attendus, critères de sélection, exigences de qualification, et la sous-section "Éléments en lien avec l'offre de Miyagi" (`elements_lien_miyagi`)
  3. **Clauses légales** : tableau des `clauses_legales` (titre, résumé, niveau de risque avec couleur), puis `resume_risques_legaux`
  4. **Recommandation** : le texte de `recommandation`, mis en évidence visuellement (encadré)
- Bouton retour au dashboard

## Gestion des erreurs

- Erreur de connexion (mauvais identifiants) : message clair sous le formulaire
- Erreur réseau lors d'un appel Supabase : message générique non bloquant, ne jamais planter l'écran
- Toujours prévoir un état de chargement pour chaque appel asynchrone (upload, insert, invoke, fetch)

## Exigences techniques

- Responsive (l'usage principal est desktop, mais ne pas casser sur mobile)
- Structure de projet Vite standard, fichier `.env.example` documentant `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
- `README.md` minimal généré avec les instructions `npm install`, `npm run dev`, `npm run build`
- Ne jamais référencer de clé Anthropic ou de service role Supabase nulle part dans le code frontend
