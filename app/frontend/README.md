# DOJO — Frontend

Application React (Vite) pour déposer un AO, suivre son analyse et consulter l'historique. Voir [`../README.md`](../README.md) pour la mise en place complète du backend (Supabase, Edge Function).

## Prérequis

Node.js (LTS, [nodejs.org](https://nodejs.org)) installé sur la machine.

## Configuration

```
cp .env.example .env
```

Renseigner dans `.env` :
- `VITE_SUPABASE_URL` — Project Settings → API du projet Supabase
- `VITE_SUPABASE_ANON_KEY` — idem

## Commandes

```
npm install
npm run dev       # serveur de développement local
npm run build     # build de production (dossier dist/)
npm run preview   # prévisualiser le build de production
```

## Déploiement

Déployer le dossier `frontend/` sur Vercel (ou équivalent), avec les mêmes variables d'environnement configurées dans les paramètres du projet de déploiement.
