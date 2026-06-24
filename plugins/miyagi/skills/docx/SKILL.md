---
name: docx
description: >
  Exporte un contenu structuré (analyse d'appel d'offres ou autre rapport Miyagi) vers un fichier
  Word (.docx) professionnel. Utilise ce skill chaque fois que l'utilisateur demande un export Word,
  un fichier .docx, ou dit "exporte en Word", "génère un Word", "sauvegarde en Word", "crée un
  document Word", etc. Reçoit le contenu à exporter depuis un autre skill (ex: analyze-rfp) ou
  directement de l'utilisateur.
---

# Export Word (.docx) pour Miyagi

Tu es un générateur de documents Word professionnels. Ton rôle est de produire un fichier `.docx`
propre, bien formaté et prêt à partager, à partir du contenu fourni.

## Étape 1 — Rassembler les informations nécessaires

Avant de créer le document, assure-toi d'avoir :

1. **Le contenu à exporter** — fourni par le skill appelant (ex: `analyze-rfp`) ou par l'utilisateur
2. **Le chemin de sauvegarde** — demande à l'utilisateur si non précisé. Suggère par défaut :
   `C:\Users\Julien\OneDrive\Bureau\` suivi d'un nom de fichier descriptif en kebab-case (ex:
   `Analyse-AO-26-521-Loto-Quebec.docx`)
3. **Le type de document** — analyse d'AO, rapport, autre (adapte la mise en page en conséquence)

## Étape 2 — Créer le document Word directement en XML (OOXML)

Un fichier `.docx` est un simple fichier ZIP contenant des fichiers XML (format OOXML). Génère-le
**directement par ce moyen, sans jamais passer par Word**, avec PowerShell pur
(`System.IO.Compression` + écriture de texte). C'est la méthode par défaut : instantanée,
déterministe, et sans dépendance à Word ou à l'automatisation COM.

**Pourquoi pas Word/COM :** l'automatisation COM (`New-Object -ComObject Word.Application`) s'est
révélée peu fiable en pratique — blocages silencieux pouvant consommer un CPU important sans jamais
aboutir, et processus `WINWORD.EXE` orphelins à nettoyer manuellement. Ne l'utilise plus, sauf
demande explicite de l'utilisateur pour une fonctionnalité Word native impossible à reproduire en
XML pur (ex: champ de table des matières à pagination automatique).

### Structure d'un .docx minimal

Trois fichiers suffisent dans l'archive ZIP :
- `[Content_Types].xml`
- `_rels/.rels`
- `word/document.xml`

### Couleurs Miyagi (hex RGB direct — pas de conversion BGR en XML)
- Bleu foncé (titres principaux) : `1F3864`
- Bleu moyen (sous-titres / en-têtes de tableau) : `2E75B6`
- Bleu pâle (lignes alternées de tableau) : `DDEBF7`
- Jaune (ligne à surligner / alerte) : `FFFF00`
- Rouge foncé (alerte texte) : `C00000`
- Blanc (texte sur fond coloré) : `FFFFFF`
- Texte normal : `000000`, ou omettre l'attribut couleur (c'est la valeur par défaut)

### Unités OOXML à connaître
- Taille de police : en **demi-points** (`w:sz`) — ex: 11 pt → `w:val="22"`
- Largeurs et marges : en **twips** (1 pouce = 1440 twips) — ex: marge de 0,6 po → `864`
- Alignement : `w:jc w:val="left|center|right|both"` (`both` = justifié)
- Page lettre portrait : `w:pgSz w:w="12240" w:h="15840"` — paysage : inverser et ajouter `w:orient="landscape"`

### Échapper le texte

Toujours échapper `&`, `<`, `>` dans le texte inséré (`&amp;`, `&lt;`, `&gt;`). Les apostrophes et
guillemets n'ont besoin d'aucun échappement dans un nœud `<w:t>`.

### Gabarit de script PowerShell

```powershell
$outputPath = "CHEMIN_COMPLET_DU_FICHIER.docx"

function Escape-Xml($t) {
    if ($null -eq $t) { return "" }
    $t = $t -replace '&','&amp;'
    $t = $t -replace '<','&lt;'
    $t = $t -replace '>','&gt;'
    return $t
}

function Add-Para($sb, $text, $sizeHalfPt, $bold, $colorHex, $alignVal, $spaceAfter) {
    $run = '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>'
    if ($bold) { $run += '<w:b/>' }
    if ($colorHex) { $run += ('<w:color w:val="' + $colorHex + '"/>') }
    $run += ('<w:sz w:val="' + $sizeHalfPt + '"/></w:rPr>')
    $pPr = '<w:pPr>'
    if ($alignVal) { $pPr += ('<w:jc w:val="' + $alignVal + '"/>') }
    $pPr += ('<w:spacing w:after="' + $spaceAfter + '"/></w:pPr>')
    [void]$sb.Append('<w:p>' + $pPr + '<w:r>' + $run + '<w:t xml:space="preserve">' + (Escape-Xml $text) + '</w:t></w:r></w:p>')
}

function Add-Bullet($sb, $text, $sizeHalfPt, $colorHex) {
    $run = '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>'
    if ($colorHex) { $run += ('<w:color w:val="' + $colorHex + '"/>') }
    $run += ('<w:sz w:val="' + $sizeHalfPt + '"/></w:rPr>')
    $pPr = '<w:pPr><w:ind w:left="360" w:hanging="240"/><w:spacing w:after="40"/></w:pPr>'
    [void]$sb.Append('<w:p>' + $pPr + '<w:r>' + $run + '<w:t xml:space="preserve">' + [char]0x2022 + '  ' + (Escape-Xml $text) + '</w:t></w:r></w:p>')
}

function Add-Cell($sb, $text, $widthTwips, $fillHex, $bold, $colorHex) {
    [void]$sb.Append('<w:tc><w:tcPr><w:tcW w:w="' + $widthTwips + '" w:type="dxa"/>')
    if ($fillHex) { [void]$sb.Append('<w:shd w:val="clear" w:color="auto" w:fill="' + $fillHex + '"/>') }
    [void]$sb.Append('</w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>')
    if ($bold) { [void]$sb.Append('<w:b/>') }
    if ($colorHex) { [void]$sb.Append('<w:color w:val="' + $colorHex + '"/>') }
    [void]$sb.Append('<w:sz w:val="17"/></w:rPr><w:t xml:space="preserve">' + (Escape-Xml $text) + '</w:t></w:r></w:p></w:tc>')
}

# headers: tableau de titres de colonnes. rows: tableau de tableaux (une entrée par ligne).
# widths: largeurs de colonnes en twips. highlightRows: indices de ligne (0-based) à surligner en jaune.
function Add-Table($sb, $headers, $rows, $widths, $headerFill, $headerColor, $altFill, $highlightRows) {
    [void]$sb.Append('<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="999999"/><w:left w:val="single" w:sz="4" w:color="999999"/><w:bottom w:val="single" w:sz="4" w:color="999999"/><w:right w:val="single" w:sz="4" w:color="999999"/><w:insideH w:val="single" w:sz="4" w:color="999999"/><w:insideV w:val="single" w:sz="4" w:color="999999"/></w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>')
    foreach ($w in $widths) { [void]$sb.Append('<w:gridCol w:w="' + $w + '"/>') }
    [void]$sb.Append('</w:tblGrid><w:tr>')
    for ($c = 0; $c -lt $headers.Count; $c++) { Add-Cell $sb $headers[$c] $widths[$c] $headerFill $true $headerColor }
    [void]$sb.Append('</w:tr>')
    for ($r = 0; $r -lt $rows.Count; $r++) {
        $fill = $null
        if ($highlightRows -contains $r) { $fill = "FFFF00" }
        elseif ($r % 2 -eq 1) { $fill = $altFill }
        [void]$sb.Append('<w:tr>')
        for ($c = 0; $c -lt $headers.Count; $c++) { Add-Cell $sb $rows[$r][$c] $widths[$c] $fill $false $null }
        [void]$sb.Append('</w:tr>')
    }
    [void]$sb.Append('</w:tbl><w:p/>')
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$work = Join-Path $env:TEMP ("docxgen_" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $work | Out-Null
New-Item -ItemType Directory -Path (Join-Path $work "_rels") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $work "word") | Out-Null

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

[System.IO.File]::WriteAllText((Join-Path $work "[Content_Types].xml"), '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>', $utf8NoBom)

[System.IO.File]::WriteAllText((Join-Path $work "_rels\.rels"), '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>', $utf8NoBom)

$sb = New-Object System.Text.StringBuilder
[void]$sb.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
[void]$sb.Append('<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>')

# ══════════════════════════════════════
# CONSTRUIRE LE CONTENU ICI
# Add-Para $sb "Texte" tailleDemiPt $gras "COULEURHEX" "alignement" espaceApres
# Add-Bullet $sb "Texte de la puce" tailleDemiPt "COULEURHEX"
# Add-Table $sb $headers $rows $widths "2E75B6" "FFFFFF" "DDEBF7" @(indices à surligner)
# ══════════════════════════════════════

# Mise en page portrait par défaut. Pour du paysage, remplacer par :
# w:pgSz w:w="15840" w:h="12240" w:orient="landscape" et ajuster les marges/largeurs de colonnes.
[void]$sb.Append('<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>')
[void]$sb.Append('</w:body></w:document>')

[System.IO.File]::WriteAllText((Join-Path $work "word\document.xml"), $sb.ToString(), $utf8NoBom)

if (Test-Path $outputPath) { Remove-Item $outputPath -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($work, $outputPath)
Remove-Item -Recurse -Force $work

Write-Output "Document créé : $outputPath"
```

### Table des matières

Il n'existe pas de vrai champ de TOC à pagination automatique en XML pur sans que Word recalcule les
champs à l'ouverture (complexité non justifiée pour l'usage interne de Miyagi). Reproduis plutôt une
liste simple des titres de section via `Add-Para` — suffisant comme repère visuel.

## Étape 3 — Structure du document pour une analyse d'AO

Quand le contenu provient du skill `analyze-rfp`, utilise cette structure :

### Page titre (centrée)
- Titre principal : "Analyse d'appel d'offres" (28pt, bleu foncé, gras)
- Sous-titre : Nom de l'organisme et numéro d'AO (14pt)
- Objet du mandat (12pt)
- Espace
- Date d'analyse (11pt, gris)
- Préparé par : Miyagi (11pt, gris)
- Saut de page

### Section 1 — Évaluation de la pertinence
- Titre H1 + catégorie en H2 (ex: "TRÈS PERTINENT")
- Paragraphe de justification
- Liste à puces : Points d'alignement
- Liste à puces : Points d'attention

### Section 2 — Résumé de l'appel d'offres
- Tableau à 2 colonnes pour les informations clés (champ / valeur)
- Paragraphe : Description du mandat
- Tableau : Critères de sélection avec pondération
- Liste à puces : Éléments en lien avec l'offre de Miyagi

### Section 3 — Analyse des clauses légales
- Tableau à 5 colonnes (Clause / Référence et citation / Résumé / Recommandation / Risque) — privilégier l'orientation paysage compte tenu du nombre de colonnes
- Surligner en jaune les lignes dont le risque est « Élevé »
- Paragraphe : Résumé des risques légaux

### Section 4 — Recommandation
- Verdict en gras (bleu foncé, 12pt)
- Paragraphe d'explication
- Liste à puces : Prérequis à valider
- Date limite en rouge foncé et gras

## Étape 4 — Confirmer la création

Après exécution du script, confirme à l'utilisateur :
- Le chemin complet du fichier créé
- Un résumé en une phrase de ce qu'il contient

## Consignes générales

- Toujours rédiger en **français**
- Le document doit être **prêt à partager** sans retouche manuelle
- Ne jamais utiliser l'automatisation COM Word (`New-Object -ComObject Word.Application`), sauf demande explicite de l'utilisateur pour une fonctionnalité Word native que le XML pur ne peut pas reproduire
- En cas d'erreur PowerShell, diagnostiquer et corriger le script avant de rapporter l'échec
- Le dossier de travail temporaire (fichiers XML avant compression) doit être supprimé après la création du .docx — seul le fichier .docx final doit subsister
