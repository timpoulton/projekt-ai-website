# Projekt-AI Homepage – Visual Style Guide (v1.0)

*(Derived exclusively from `index.html` inline styles)*

---

## 1. Brand Essence
Futuristic yet approachable. The landing experience combines a dark **cinematic hero** with clean light sections. Conversation-driven copywriting and playful gradient accents convey innovation without overwhelming the visitor.

---

## 2. Colour Palette
| Role | HEX | Notes |
|------|-----|-------|
| Text Prim. (light sections) | `#333333` | Body copy |
| Text Prim. (dark hero) | `#FFFFFF` | Headings & hero copy |
| Accent Teal | `#1DD1A1` | Hover states, subtle calls to action |
| Gradient Accent | `linear-gradient(120deg,#FF38E4 0%,#FF00FF 30%,#B54DFF 60%,#5A6DFF 100%)` | Highlight text, button hovers, link hovers |
| Dark Hero BG | `#1A1A1A` | Full-bleed hero backdrop |
| Light Section BG | `#F5F5F5` | About & subsequent content |
| Slide-Menu BG | `rgba(0, 0, 0, 0.98)` | Mobile / overlay nav |
| Overlay | `rgba(0,0,0,0.7)` | Dim background when menu is active |
| CTA Glass BG | `rgba(255,255,255,0.05)` | Frosted box inside hero |
| CTA Border | `rgba(255,255,255,0.2)` | 1 px border around CTA box |

---

## 3. Typography
Family: **Inter** (Google Fonts)  
Base body size: **16 px**

| Element | Size (desktop) | Weight | LS | Notes |
|---------|---------------|--------|----|-------|
| Hero H1 | clamp 48 – 88 px | 400 | -0.025 em | Gradient span highlight |
| Section H2 | clamp 36 – 64 px | 400 | 0 | Two-line headings in About |
| Nav / Menu | 18 – 28 px | 400 | -0.01 em | Large slide-menu links |
| Body | 16 px | 400 | 0 | | 
| Small Caption | 11 px | 600 | 0.12 em | `.section-label` uppercase |

Line-height: **1.6** body, **1.05–1.2** headings.

---

## 4. Layout & Spacing
• **Container**: max-width **1400 px**; horizontal padding **60 px**.  
• **Section vertical padding**:
  * Hero: top 140 px, bottom 80 px (allows fixed header).  
  * About: 140 px top & bottom.
• **Grid gaps**: 120 px between columns in `.about-content`.  
• **Buttons**: padding 12 × 28 px; 50 px pill radius.
• **CTA glass box** within hero: radius 16 px, padding 32 px, max-width 380 px.

Spacing rhythm still follows an 8-px multiple philosophy but scaled up (60-120 px) for a premium feel.

---

## 5. Core Components
### 5.1 Header & Navigation
• Transparent until scrolled; dark mode variant (`header.dark`) switches to near-white backdrop + dark text.  
• Burger toggles full viewport **slide-menu** from the right; overlay dims page.

### 5.2 Hero
• Full-width video (`autoplay muted loop`) sits behind semi-transparent dark overlay for legibility.  
• Gradient-highlighted keywords via `span.highlight` + `--vibrant-gradient`.

### 5.3 CTA Button
Default: 1px translucent border, white text.  
Hover: gradient text + border-image using `--vibrant-gradient`, subtle lift `translateY(-1px)`.

### 5.4 Frosted CTA Box
Glass-morphism: 5 % white background + blur(10 px), white-20 border, 16 px radius.

### 5.5 About Section
Two-column grid (text + supporting copy/CTA) on light grey background (`#F5F5F5`).

### 5.6 Clients Logo Grid
Adaptive grid: 6 columns desktop → 3 (≤1024 px) → 2 → 1.  
Each logo sits in 120 px square wrapper, with 1 px #EEE border and 8 px radius.

---

## 6. Interaction & Motion
| Effect | Implementation |
|--------|---------------|
| Gradient Shift | `@keyframes gradientShift` 0 → 100 % (4 s linear) applied to highlighted text & buttons on hover |
| Menu Toggle | Transform lines into X and slide menu transitions (`right: -100% → 0`) 0.4 s |
| Custom Cursor | Circular cursor blend element follows pointer except when menu is open |

---

## 7. Accessibility
• Maintain sufficient contrast: hero copy over `#1A1A1A` uses #FFF or rgba(255,255,255,0.8).  
• Links grow or shift to indicate focus (hover + gradient).  
• Burger icon accessible via keyboard (`button` element).

---

## 8. Asset Production Checklist
- [ ] Inter font embedded or linked from Google Fonts.  
- [ ] Primary gradient (`--vibrant-gradient`) applied consistently for highlights.  
- [ ] Container padding 60 px and max-width 1400 px observed.  
- [ ] Hero uses dark overlay 50 % and video @0.35 opacity.  
- [ ] Buttons use 12 × 28 px padding, pill radius, gradient hover.  
- [ ] Frosted CTA box glass-effect (blur 10 px).  
- [ ] About section background `#F5F5F5` spans full width.  
- [ ] Logo grid follows responsive column rules.  
- [ ] Animations respect `prefers-reduced-motion` (to be added if needed).

---

## 9. Token Reference (CSS)
```css
:root {
  --vibrant-gradient: linear-gradient(120deg,#ff38e4 0%,#ff00ff 30%,#b54dff 60%,#5a6dff 100%);
}
```
Other values are hard-coded; consider abstracting them into additional tokens for future scalability.

---

### How to Use
When designing new homepage assets or sections, start with the light-section template (`#F5F5F5` background, container 60 px) or dark hero template (`#1A1A1A` + gradient highlight). Apply typography scale and spacing listed above, and use the accent teal and vibrant gradient for interactive elements. This will keep every addition visually cohesive with the current landing page. 