-- Projet DOJO — MVP Phase 1 (analyse et qualification automatique des AO)
-- Table unique appels_offres + bucket Storage + RLS (usage personnel, prêt pour multi-utilisateurs futur)

-- ── Table principale ──────────────────────────────────────────────────────

create table public.appels_offres (
  id                        uuid primary key default gen_random_uuid(),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  cree_par                  uuid not null references auth.users(id) default auth.uid(),

  -- Fichier source
  nom_fichier               text not null,
  storage_path              text not null,

  -- Suivi du traitement
  statut                    text not null default 'en_attente'
                              check (statut in ('en_attente', 'analyse_en_cours', 'analyse_terminee', 'erreur')),
  erreur_message            text,

  -- Section 1 — Évaluation de la pertinence
  pertinence                text
                              check (pertinence in ('tres_pertinent', 'pertinent', 'peu_pertinent', 'non_pertinent')),
  justification_pertinence  text,
  points_attention          jsonb,

  -- Section 2 — Résumé de l'appel d'offres
  organisme                 text,
  titre_objet               text,
  numero_reference          text,
  date_limite_soumission    timestamptz,
  budget_estime             text,
  resume_mandat             text,
  resume_complet            jsonb,

  -- Section 3 — Analyse des clauses légales
  clauses_legales           jsonb,
  resume_risques_legaux     text,

  -- Section 4 — Recommandation
  recommandation            text
);

comment on table public.appels_offres is 'Projet DOJO - Phase 1 : analyse automatique des appels d''offres pour Miyagi';
comment on column public.appels_offres.resume_complet is 'Objet jsonb : dates_cles, livrables_attendus, criteres_selection, exigences_qualification, elements_lien_miyagi';
comment on column public.appels_offres.clauses_legales is 'Tableau jsonb d''objets {titre, resume, niveau_risque}';

create index idx_appels_offres_cree_par on public.appels_offres(cree_par);
create index idx_appels_offres_statut on public.appels_offres(statut);
create index idx_appels_offres_date_limite on public.appels_offres(date_limite_soumission);

-- ── updated_at automatique ───────────────────────────────────────────────

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_appels_offres_updated_at
  before update on public.appels_offres
  for each row
  execute function public.set_updated_at();

-- ── RLS sur la table ──────────────────────────────────────────────────────

alter table public.appels_offres enable row level security;

create policy "Propriétaire peut tout faire sur ses AO"
  on public.appels_offres
  for all
  to authenticated
  using (auth.uid() = cree_par)
  with check (auth.uid() = cree_par);

-- ── Bucket Storage pour les PDF source ──────────────────────────────────

insert into storage.buckets (id, name, public)
values ('appels-offres', 'appels-offres', false)
on conflict (id) do nothing;

-- Convention de chemin attendue par les policies ci-dessous : {user_id}/{uuid}-{nom_fichier}

create policy "Propriétaire peut uploader ses fichiers"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'appels-offres'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Propriétaire peut lire ses fichiers"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'appels-offres'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Propriétaire peut mettre à jour ses fichiers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'appels-offres'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Propriétaire peut supprimer ses fichiers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'appels-offres'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
