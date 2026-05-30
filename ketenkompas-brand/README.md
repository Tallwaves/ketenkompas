# KetenKompas — Brand bundle

**Palet:** Marine & Brons
**Typografie:** Archivo (Google Fonts) — wordmark 700, tagline 600 uppercase / letter-spacing 0.14em

## Bestanden

| Bestand | Gebruik |
|---|---|
| `colors.css` | CSS custom properties (`--kk-*` + semantische `--color-*`). Link 1× in je app. |
| `colors.json` | Design tokens (W3C-stijl) voor token-pipelines / Style Dictionary. |
| `tailwind.colors.js` | Tailwind `extend.colors` snippet. |
| `logo-mark.svg` | Kompasroos beeldmerk (op licht). |
| `logo-mark-on-dark.svg` | Kompasroos voor donkere achtergronden. |
| `logo-lockup-light.svg` | Volledige lockup op witte/lichte achtergrond. |
| `logo-lockup-dark.svg` | Volledige lockup op marine inkt. |
| `app-icon.svg` | App-icoon 512×512 met afgeronde hoeken. |

## Kleuren

### Primair
- `#0B2A40` **Inkt** — tekst & koppen
- `#143A56` **Marine** — donkere UI / achtergronden
- `#2C5E84` **Blauw** — primair · links · accenten
- `#6B93B4` **Licht** — secundair · vlakken
- `#A8842C` **Brons** — kompas-noord · highlight · cta

### Uitbreiding (UI & scenario-tool)
- `#EEF2F6` **Mist** — pagina-achtergrond
- `#D5DEE7` **Lijn** — scheidingslijnen
- `#5E7384` **Slate** — bijschriften & meta
- `#C9A659` **Brons-licht** — zachte highlight
- `#3F7E3F` **OK** — goed / gezond (groene status)
- `#B3492E` **Alert** — verstoring / uitval (rode status)

## Gebruik

### Vanilla CSS
```html
<link rel="stylesheet" href="/ketenkompas-brand/colors.css">
```
```css
.button-primary { background: var(--color-primary); color: var(--kk-paper); }
.status-ok { color: var(--color-success); }
.status-fail { color: var(--color-danger); }
```

### Tailwind
```js
// tailwind.config.js
const kk = require('./ketenkompas-brand/tailwind.colors');
module.exports = {
  theme: { extend: { colors: kk } },
};
```
```html
<button class="bg-kk-blue text-white hover:bg-kk-navy">Primaire actie</button>
<span class="text-kk-ok">Gezond</span>
<span class="text-kk-alert">Uitval</span>
```

## Voor Claude Code

Drop deze hele map (`ketenkompas-brand/`) in je project en wijs Claude Code naar dit bestand:

> "Gebruik de tokens uit `ketenkompas-brand/colors.css` voor alle kleuren. Voor statussen: `--color-success` voor 'goed', `--color-danger` voor 'verstoring/uitval'. Kompas-noord en CTA-highlights gebruiken `--color-accent` (brons)."

Claude Code leest `colors.css` en `README.md` automatisch wanneer ze in de project-root staan.
