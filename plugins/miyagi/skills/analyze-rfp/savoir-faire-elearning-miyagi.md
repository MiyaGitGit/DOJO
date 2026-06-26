# Savoir-faire elearning de Miyagi — référence pour l'analyse d'AO

> Synthèse produite le 2026-06-26 à partir de l'export complet de l'espace Google Chat interne
> "Mission accomplie" (Miyagi, mai 2023 à 2026), où les consultants partagent leurs livrables de
> fin de mandat. Base factuelle issue de l'historique réel des projets, pas d'une description
> théorique de l'offre de service. À utiliser en complément de la section "Profil de Miyagi" du
> skill `analyze-rfp`, notamment pour évaluer l'adéquation technique réelle (pas seulement
> l'adéquation pédagogique/gestion du changement) lorsqu'un AO exige des compétences techniques
> précises en elearning.

## 1. Types de contenus confirmés

- **Capsules autoportantes (format dominant)** : Articulate Rise/Storyline, publiées sur Articulate
  Review. Exemples : Énergir SuccessFactors, Hydro-Québec SST, conversion de 34 capsules pour
  Groupe Jean-Coutu, capsule Circuit Électrique HQ pour 1M d'utilisateurs, jeu drag-and-drop
  Desjardins pour 40 000 apprenants, capsule conformité réglementaire Énergir (écoblanchiment).
- **Vidéos et animations** : Vyond très utilisé (Desjardins, plusieurs langues, voix
  professionnelles), vidéo interactive de 9 minutes pour Hydro-Québec, refonte HQ de 70+ livrables
  en 14 mois, capsule produite en 8 jours pour Airbus, 21 vidéos en 3 langues pour Logistec/Dayforce.
- **Jeux et simulations interactives** : jeu de tri pour Ici Récup, simulation pour la Société de
  transport de Laval, activité glisser-déposer avec logique conditionnelle (Storyline), quête type
  jeu vidéo pour Desjardins Maestro.
- **Conversion/migration de contenu** (pertinent pour les AO de migration numérique) : Camtasia →
  PowerPoint (Saputo, pour des raisons de portabilité des fichiers sources), Storyline → Rise
  (Groupe Jean-Coutu).
- **Soutien à la performance / documentation** : base de connaissances SharePoint, portail Sécurité
  Desjardins (575 pages, 600 documents reconçus sur 2,5 ans), microlearning Rise + EdCast/Cornerstone.

## 2. Outils et technologies confirmés

| Outil | Fréquence/contexte |
|---|---|
| Articulate Rise | Très fréquent — outil principal pour capsules autonomes et microlearning |
| Articulate Storyline | Fréquent — interactivité avancée (drag and drop, variables, déclencheurs, Motion path) |
| Articulate Review (360) | Systématique — plateforme de partage/validation client de presque tous les livrables |
| Vyond | Animation/vidéo — au moins 5 projets distincts |
| Camtasia | Mentionné une fois, explicitement abandonné (enjeux de portabilité des fichiers sources) |
| Illustrator / Storyset | Personnalisation de visuels (un projet) |
| EdCast (Cornerstone) | LMS client utilisé pour héberger des activités — seule mention d'un LMS spécifique en contexte de conception |
| SAP SuccessFactors, UKG, Dayforce, JD Edwards | Systèmes RH/LMS clients sur lesquels Miyagi **forme les utilisateurs**, sans précision d'intégration technique |
| PowerPoint | Solution de repli "autonomisable" pour le client |
| IA générative (Copilot, Gemini, ChatGPT) | Usage croissant (2025-2026) mais périphérique à la production elearning |

## 3. Capacités techniques avancées — le point critique pour l'évaluation des AO

| Capacité | Statut | Détail |
|---|---|---|
| **SCORM / xAPI** | ❌ Aucune preuve | Le terme n'apparaît jamais dans 3 ans d'historique. Les livrables sont partagés via lien public Articulate Review, pas via export/import LMS documenté. |
| **Intégration LMS** | ⚠️ Preuve indirecte seulement | Miyagi forme les utilisateurs *sur* des LMS clients (SuccessFactors, EdCast, UKG), mais rien n'indique un travail technique de déploiement/paramétrage de contenu (connecteurs, API, reporting de complétion) dans ces plateformes. |
| **Accessibilité WCAG** | ❌ Absence totale | Aucune mention de WCAG, lecteurs d'écran, sous-titrage obligatoire ou normes d'accessibilité dans l'ensemble du fichier. |
| **Production multimédia** | ✅ Preuve directe solide | Vidéos/animations multilingues avec voix professionnelles, mais produites par les concepteurs eux-mêmes via des outils accessibles (Vyond, Storyline), pas par une équipe de production audiovisuelle dédiée. Pas de mention de studio, motion design avancé (After Effects) ou 3D. |
| **Interactivité avancée** | ✅ Preuve directe, complexité modeste | Variables, déclencheurs, logique conditionnelle dans Storyline — niveau natif de l'outil, pas de scripting JavaScript personnalisé ni de SDK xAPI. |

**Implication pour l'analyse d'AO** : si un AO exige explicitement la conformité SCORM/xAPI ou WCAG
comme critère technique éliminatoire, ces capacités ne sont **pas démontrées** dans cet historique.
Le signaler clairement comme point d'attention plutôt que de présumer une compétence interne, et
recommander une vérification par d'autres sources (CV, portfolio technique, partenaire consortium)
avant de soumissionner seul sur ce type de mandat.

## 4. Profil type des mandats

- **Secteurs clients** : grands comptes québécois, très concentré — Hydro-Québec (très récurrent),
  Desjardins, Énergir, Groupe Jean-Coutu/Metro, Agnico Eagle (international — Finlande), Agropur,
  RONA, Saputo, Resolute, Reitmans, Logistec, STL, Airbus, Ville de Laval, une firme de gestion de
  patrimoine.
- **Types de mandats** : très majoritairement gestion du changement + formation liée à des
  déploiements de systèmes d'entreprise (SAP SuccessFactors, SAP Ariba, SAP S/4HANA, Workday, UKG,
  Dayforce, JD Edwards) — cœur de métier confirmé. Quelques mandats de refonte de contenu sans lien
  direct à un déploiement ERP.
- **Échelle** : très variable — de 8 jours (Airbus) à plusieurs années (Desjardins Maestro 3+ ans,
  portail Sécurité Desjardins 2,5 ans). Publics cibles de quelques dizaines à plus d'un million
  d'utilisateurs. Équipes généralement petites (1 à 4 concepteurs par mandat).

## 5. Citations clés (verbatim, à utiliser pour étayer une analyse si pertinent)

1. Amelie Bois-Ouellet, 25 mai 2023 (Énergir, ENE012) : *"nous avons fait les capsules pour les
   utilisateurs finaux dans Rise pour faciliter la vie à nos experts pour la mise à jour."*
2. Marie-Claude Huard, 27 oct. 2023 (Desjardins) : *"je suis pas mal fière d'une capsule que j'ai
   créée sur VYond (1ère expérience) qui est obligatoire pour l'ensemble des employés du
   Mouvement [...] Nous avons eu recours à 3 voix professionnelles."*
3. Pascale Sauvé, 26 mars 2024 (Saputo, SAP017) : *"Camtasia est un outil qui vit des enjeux lors du
   transfert des fichiers sources [...] nous leur avons proposé de transférer les capsules dans PPT
   et de former une ressource interne pour pérenniser leurs livrables."*
4. Amelie Bois-Ouellet, 10 avril 2024 (GJC025) : *"Justine a terminé GJC025 - Conversion de capsules
   Storyline vers Rise [...] Depuis octobre 2023, Justine a converti 8 modules pour un total de 34
   capsules!"*
5. Annie St-Pierre, 27 nov. 2024 (Agnico) : *"Elle a appris à utiliser OGL et a développé 90% du
   matériel de soutien avec cet outil."*
6. Pascale Sauvé, 30 sept. 2025 (Hydro-Québec) : *"Utilisation de EdCast (Cornerstone) pour héberger
   les fiches d'activités [...] formant un parcours dynamique qui remplace le cahier de
   l'apprenant."*
7. Kim Lascelles, 17 sept. 2025 (Desjardins) : *"Une capsule interactive en Storyline + un
   aide-mémoire [...] Le parcours inclut un jeu de type 'drag and drop' et plusieurs visuels conçus
   à partir de Storyset, puis personnalisés [...] à l'aide du logiciel Illustrator."*
8. Melissa Lozeau, 8 déc. 2025 (Hydro-Québec) : *"nous avons conçu plus de 70 livrables, dont : des
   modules elearning interactifs, des vidéos pédagogiques, des aides à la tâche [...]"*
9. Patricia Karoutas, 26 janv. (Logistec/Dayforce) : *"For operations: 1 training presentation, 2
   mobile application videos, 5 time-entry clocking videos, all in 3 languages! (21 videos total)."*
10. Laetitia Marchand, 22 avril (projet personnel, Storyline) : *"J'ai ajouté une fonction au
    glisser-déposer libre natif de Storyline : un bouton 'recommencer' [...] qui lance une animation
    de type Motion path."*

## Conclusion

Miyagi a une pratique réelle et répétée de conception de capsules elearning interactives dans
l'écosystème **Articulate (Rise + Storyline + Review)**, avec un usage compétent de **Vyond** pour
l'animation/vidéo, et une capacité démontrée de **conversion/migration de formats**. Cohérent avec
des AO demandant de la conception multimédia légère à moyenne dans des outils d'auteurage standards,
typiquement en accompagnement de déploiements ERP/SIRH.

Aucune preuve de maîtrise de **SCORM/xAPI** ou d'**accessibilité WCAG** dans cet historique.
L'**intégration LMS** se limite à former les utilisateurs sur des systèmes clients, pas à du
déploiement/paramétrage technique de contenu. Ces lacunes doivent être explicitement signalées dans
toute analyse d'AO qui en ferait un critère technique important ou éliminatoire.
