-- Projet DOJO — Phase 2 (transfert manuel des AO retenus vers Wrike)
-- Ajoute le suivi du transfert vers Wrike sur la table appels_offres existante.
-- Le déclenchement reste manuel (bouton "Transférer vers Wrike" sur la page de
-- détail, cliqué par un humain après lecture de l'analyse) : DOJO ne décide
-- jamais lui-même qu'un AO est assez pertinent pour être transféré.

alter table public.appels_offres
  add column wrike_statut text not null default 'non_transfere'
    check (wrike_statut in ('non_transfere', 'transfert_en_cours', 'transfere', 'erreur')),
  add column wrike_erreur_message text,
  add column wrike_url text;

comment on column public.appels_offres.wrike_statut is
  'Suivi du transfert manuel vers Wrike (Phase 2) — jamais modifié automatiquement par l''analyse';
comment on column public.appels_offres.wrike_url is
  'Lien vers le projet Wrike créé, rempli une fois le transfert réussi';

create index idx_appels_offres_wrike_statut on public.appels_offres(wrike_statut);

-- Pas de nouvelle policy RLS nécessaire : la policy existante "Propriétaire peut
-- tout faire sur ses AO" (for all) couvre déjà ces nouvelles colonnes.
