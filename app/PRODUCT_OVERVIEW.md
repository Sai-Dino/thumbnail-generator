# Thumbnail Generator Web App – Product Specification (Part 1 of 3)

## 0 Document Purpose
This specification explains what we are building and why, in sufficient detail for designers, engineers, and non‑technical stakeholders. Part 1 covers Product Overview, Users, Goals, Core Flows, and Functional Requirements. Parts 2 & 3 (to follow) will dive into Engineering Architecture / API contracts and UI / Visual Design Specifications respectively.

## 1 Product Vision
Create a browser‑based, interactive thumbnail‑and‑show‑art generator that lets any podcaster produce eye‑catching, on‑brand visuals in < 60 seconds—no design skills needed. The tool doubles as a lead‑generation funnelfor AIP by collecting verified podcaster emails at export.

## 2 Target Users & Personas
| Persona | Pain Today | Motivation | Success Signal |
|---|---|---|---|
| Indie Podcaster ("Alex") | Spends hours in Canva / Midjourney wrestling with faces & fonts. | Needs fast, professional‑looking thumbnails to stand out on YouTube. | Generates a thumbnail in one try and downloads it. |
| Podcast‑Network Producer ("Nina") | Manages 8 shows; designers are a bottleneck. | Wants a repeatable, brand‑safe pipeline that junior staff can use. | Saves 3 hrs/episode and gets consistent art across all shows. |
| Enterprise Marketing Lead ("Chris") | Needs brand compliance + speed. | Wants thumbnails that pass brand checks without agency fees. | Approves assets first review; auto‑applies brand kit each time. |

## 3 Business Goals & KPIs
| Goal | KPI | Target at 6 months |
|---|---|---|
| Lead Generation | Verified podcaster emails collected | 3 000 |
| Brand Reach | "Made with AIP" badge impressions | 1 M |
| Conversion | % of free users booking an AIP sales call | 5 % |
| User Delight | CSAT score after export | ≥ 4.5 / 5 |

## 4 Core User Flow (Happy Path)
Landing Page → "Generate Thumbnail Now" CTA.
Upload Faces (Host + Guest) – automatic background removal.
Select Style (dropdown) & Realism Slider (0–100 %).
Enter/Generate Episode Title
 • Have title → free‑text → "Refine" button (GPT).
 • Need title → 140‑char blurb → AI suggests 3 titles.
Generate – server queue; spinner shows status (≤ 15 s target).
Preview Canvas – layered thumbnail + square show art.
 • Drag faces/text, tweak colors via sidebar.
 • Randomize Background (< 10 options per style).
Export – email gate modal; user enters address → instant download (.png + .psd or .svg layer file).
Thank‑You / Upsell – suggests booking a call with AIP.

## 5 Functional Requirements (MVP)
### 5.1 Generation
Input validation for image resolution (≥ 512 px) & aspect ratio.
Style preset maps to pre‑configured Stable Diffusion prompt + seed jitter logic.
Randomization engine must guarantee visual variance per generation.
Output sizes: 1280 × 720 px (YouTube) + 3000 × 3000 px (Show‑art).
### 5.2 Editing Layer
Layers: BG, Host Face, Guest Face(s), Title Text, Logo Badge.
Basic transforms: drag, scale, rotate (snap to grid). No free‑draw.
Color palette locked to style but can shuffle accent hues.
### 5.3 Account‑Lite Model
First export requires verified email (magic link). No password.
Store generation history (last 20) tied to email.
### 5.4 Brand Kits (Phase 2)
User can save fonts, colors, logo for auto‑apply. Not in MVP.
### 5.5 Billing / Pricing
Free tier: 1 export w/ badge watermark.
Starter tier ($9/mo): unlimited exports, badge removable.
Pro tier ($49/mo): brand kit, batch generation, 3 style slots.

## 6 Non‑Functional Requirements
| Dimension | Requirement |
|---|---|
| Performance | Generation P99 ≤ 30 s; UI first‑load < 2 s on 3G. |
| Reliability | 99.5 % uptime; generation queue retries 3× on failure. |
| Security | Images deleted after 30 days; GDPR‑compliant data retention. |
| Accessibility | WCAG 2.1 AA for all interactive elements. |
| Scalability | Burst to 100 concurrent generations (GPU autoscaling). |

## 7 Risks & Mitigations (MVP)
| Risk | Impact | Mitigation |
|---|---|---|
| AI generates duplicate art for different users | Low uniqueness → brand dilution | Seed jitter + BG shuffle + title layout variance logic. |
| Offensive outputs (NSFW) | Reputation damage | Safety checker on all diffusion outputs; reject & regenerate. |
| Face‑crop errors | Poor UX | Use dual‑model cropping (MediaPipe + InsightFace) and show preview before generate. |

## 8 Deliverables for Next Parts
Part 2 – System Architecture, API specs, database schema, deployment plan, CI/CD.
Part 3 – Wireframes, UI states, component library, brand style tokens, sample prompts.

Prepared by: AIP Product Team  •  Last updated: 05 May 2025 