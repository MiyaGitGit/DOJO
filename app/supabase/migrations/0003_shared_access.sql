-- Projet DOJO — Passage à un accès partagé (plusieurs comptes Miyagi authentifiés)
-- Remplace les policies "propriétaire uniquement" par des policies "tout compte
-- authentifié Miyagi" : tous les comptes voient et gèrent tous les AO, avec les
-- mêmes droits (dépôt, consultation, transfert Wrike).

-- ── Table appels_offres ──────────────────────────────────────────────────

drop policy "Propriétaire peut tout faire sur ses AO" on public.appels_offres;

create policy "Compte authentifié peut tout faire sur les AO"
  on public.appels_offres
  for all
  to authenticated
  using (true)
  with check (true);

-- ── Bucket Storage "appels-offres" ───────────────────────────────────────

drop policy "Propriétaire peut uploader ses fichiers" on storage.objects;
drop policy "Propriétaire peut lire ses fichiers" on storage.objects;
drop policy "Propriétaire peut mettre à jour ses fichiers" on storage.objects;
drop policy "Propriétaire peut supprimer ses fichiers" on storage.objects;

create policy "Compte authentifié peut uploader des fichiers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'appels-offres');

create policy "Compte authentifié peut lire les fichiers"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'appels-offres');

create policy "Compte authentifié peut mettre à jour les fichiers"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'appels-offres');

create policy "Compte authentifié peut supprimer les fichiers"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'appels-offres');
