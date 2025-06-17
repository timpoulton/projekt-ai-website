# Projekt-AI – Core Visual & Brand Design Brief (v1.0)

---

## 1. Brand Personality & Tone
* Futuristic, technical, energetic – targeting automation, nightlife & music tech.
* Copywriting voice: confident startup entrepreneur; innovation-focused; minimal jargon.

## 2. Colour System
### Foundations (dark UI)
| Token | HEX |
|-------|-----|
| `--bg-primary`   | `#0A0A0A` |
| `--bg-secondary` | `#111111` |
| `--bg-card`      | `#1A1A1A` |
| `--bg-accent`    | `#1E1E1E` |

### Accent / Brand Colours
| Token | HEX | Usage |
|-------|-----|-------|
| `--accent-primary`   | `#00FF88` | Electric green – CTAs, key icons |
| `--accent-secondary` | `#FF0080` | Hot pink – interactive hover, highlights |
| `--accent-tertiary`  | `#0080FF` | Cyan-blue – tertiary accents |

### Gradients & Glow
* **Primary gradient:** 135° → `#00FF88` → `#FF0080`
* **Accent glow shadow:** `0 0 40px rgba(0,255,136,.2)`
* Use subtle radial hazes (10 % opacity) in opposite corners for depth.

## 3. Typography
| Role | Size (desktop) | Weight | Notes |
|------|---------------|--------|-------|
| Display / H1 | 60–96 px | 800 | clamp scaling |
| H2 | 36–56 px | 700 | — |
| H3 | 24–32 px | 700 | — |
| Body | 16 px | 400 | Line-height 1.6 |
| Caption / XS | 12 px | 400 | — |

* Family: **Inter**, system-ui fallback  
* Letter-spacing: **-0.02 em** on H1-H3.

## 4. Spacing & Layout
* 8 px base grid (`--space-xs = 8px`).  
* Section padding: **120 px** top & bottom.  
* Max content width: **1400 px**; horizontal padding: **32 px**.  
* Card radius: **16 px** (feature cards 24 px).  
* Shadows: subtle `0 4 20 rgba(0,0,0,.3)`; strong `0 20 60 rgba(0,0,0,.5)`.

## 5. Components
* **Header bar:** 80 % opaque black + 20 px blur, 1 px white-10 border.
* **Buttons**
  * Primary – gradient fill, white text, 18×32 px padding, radius 8 px.
  * Secondary – outline 1 px `--accent-primary`, transparent bg; hover fills with gradient.
* **Cards:** dark bg, soft inner glow, hover scale **1.03** + neon outline.
* **Metric block:** Numeric (H3), label (`text-secondary`), subtle divider line.
* **Badges:** 10 px radius pill, 12 px / 500 text, accent bg variants.

## 6. Imagery & Iconography
* Photography: high-contrast, cyan/pink neon washes; overlay 10 % gradient.
* Icons: 1.5 px rounded stroke, white or `--accent-primary`.
* Optional SVG 10×10 tech grid at 5 % white.

## 7. Animation & Motion
* Default transition: `all .4s cubic-bezier(.4,0,.2,1)`.
* Entrances: `fadeInUp` (Y-30 → 0, 600 ms), stagger 0.1 s.
* Interactive: pulse glow on CTAs; hover scale 1.05 on logos.  
  Respect `prefers-reduced-motion`.

## 8. Asset Production Rules
1. Canvas uses `#0A0A0A` full-bleed.
2. Maintain 32 px safe gutter; key content within 1200 px.
3. Headings employ gradient text-clip.
4. Primary actions always use gradient; avoid flat accents.
5. No colours outside palette; neutrals follow grey-50→900 scale.
6. Images framed with 16 px radius.
7. One shadow tier per element (see §4).
8. Stick to 8 px multiples for spacing.

## 9. Accessibility & Contrast
* Body text contrast ≥ **AA** against `#0A0A0A`.
* Interactive targets ≥ **44×44 px**.
* Visible focus ring: 2 px `#00FF88`.

## 10. Asset Delivery Checklist
- [ ] Inter font embedded or outlined.  
- [ ] Primary gradient or accent colour present.  
- [ ] 8 px spacing rhythm respected.  
- [ ] Dark background & card styling intact.  
- [ ] Shadows match specification.  
- [ ] Text styles follow scale.  
- [ ] Palette-compliant colours only.  
- [ ] Export @2×, sRGB.

---

### How to Use
For new portfolio PDFs, decks or one-pagers:
1. Build a master page with dark background, 1400 px grid and gradient headline.
2. Copy tokens from `style.css` / `dark-theme.css` to ensure parity.
3. Follow this brief as the single source of truth for visual consistency. 