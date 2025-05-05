# Thumbnail Generator Web App – Design & UI Specification (Part 3 of 3)

## 1 Brand & Style Tokens
| Token | Value | Usage |
|---|---|---|
| Font Primary | Inter, 400–700 | Body text, UI labels |
| Font Display | Sora, 600–800 | Headings, CTA buttons |
| Color Primary | #FF6B00 | Accent buttons, sliders |
| Color Gray‑90 | #1E1E1E | Canvas bg |
| Color Gray‑10 | #F7F7F7 | Panels, modals |
| Border Radius | 12 px | Cards, inputs |
| Shadow Card | 0 2 4 rgba(0,0,0,.04) | Elevation 1 |

## 2 Page Wireframes (description)
- **Landing Page**
  - Hero banner with instant demo GIF.
  - “Generate free thumbnail” CTA.
  - Social proof logos + FAQ accordion.
- **Generator Wizard (3‑step modal)**
  1. Upload faces → inline crop preview.
  2. Select style + realism slider (vertical).
  3. Title section: “Have title / Need title”.
  - Progress bar top.
- **Canvas Editor**
  - Left sidebar = Layers list.
  - Right sidebar = Style tweaks (BG shuffle, font weight, color accent).
  - Center = 1280 × 720 artboard; toggle to square preview.
  - Top = Undo/Redo, Randomize, Download.
- **Export Modal**
  - Email gate → magic‑link.
  - After verify: Download PNG, PSD, Show‑art.
  - Upsell card.

## 3 Component Library
| Component | States | Notes |
|---|---|---|
| Button | primary / secondary / disabled / loading | 48 px height, Sora 600. |
| Slider | default / drag / disabled | Shows % tooltip on hover. |
| Dropdown | closed / open / option‑selected | Searchable list for Style presets. |
| Upload Card | idle / drag‑over / uploading / error | Shows thumbnail preview w/ remove icon. |
| Modal | base / oversized | Uses Radix Dialog under hood. |
| Layer Chip | selected / hover / locked | Icon + layer name; reorder via drag. |
| Badge | default | “Made with AIP” — hidden when user on paid tier. |

## 4 Interaction & Motion
- Drag & Drop: Snap‑to‑grid 8 px; show blue guide lines when near edge.
- Slider: Elastic ease‑out; realism value animates 0.2 s.
- Generate BTN: Morphs into spinner; CTA text fades to 0.
- Randomize BG: Quick crossfade (200 ms) between BG layers.

## 5 Accessibility (WCAG 2.1 AA)
| Requirement | Implementation |
|---|---|
| Keyboard nav | All controls reachable via Tab; visible focus outline (#FF6B00, 2 px). |
| Contrast | Text contrast ≥ 4.5:1 vs bg. |
| Alt text | Generated assets have alt: “Podcast thumbnail preview”. |
| Motion | Prefers‑reduced‑motion → disable slider easing, crossfades. |

## 6 Empty, Error & Edge States
| Context | Message / UI |
|---|---|
| No faces uploaded | Placeholder illustration + “Drag images here”. |
| Upload fail | Toast: “File too large (>10 MB) or unsupported format”. |
| Generation timeout | Modal: “Our GPUs are busy, please retry in a minute.” + Retry CTA. |
| Safety checker fail | “Image blocked for safety. Try another style or seed.” |

## 7 Sample Prompt Table (per style)
| Style ID | Prompt snippet | BG variants |
|---|---|---|
| photo_cine | “cinematic portrait, realistic lighting, depth of field” | dark gradient, studio backdrop |
| semi_edi | “editorial illustration, flat shading, muted palette” | off‑white texture, paper grain |
| bold_split | “vector pop‑art, split complementary colors, bold outlines” | diagonal split – orange/teal |

## 8 Analytics Events (Frontend)
| Event | Payload |
|---|---|
| face_upload_success | { fileSize, imgWidth, imgHeight } |
| generate_click | { styleId, realism, titleType } |
| generation_complete | { durationMs, seed } |
| download | { fileType, tier } |

## 9 Responsive Breakpoints
- **Mobile (≤ 640px):** Wizard is full‑screen; canvas editor disabled (only preview + regenerate).
- **Tablet (641–1024px):** Canvas 720 × 405 scaled; sidebars collapsible.
- **Desktop (> 1024px):** Full editor.

## 10 Hand‑Off Checklist
✔ Figma file with frames for Landing, Wizard, Canvas, Export.
✔ Component library documented (variants + auto‑layout).
✔ Brand tokens exported as Tailwind config.
✔ Motion spec in Framer prototype.

Prepared by: AIP Design • Updated 05 May 2025 