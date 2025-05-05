# Thumbnail Generator Web App – Engineering & Architecture Specification (Part 2 of 3)

## 1 High‑Level Architecture
Frontend (Next.js) ──► Gateway API (Node + Express) ──► Redis Queue ──► GPU AI Worker (Python)
     ▲                           ▲                                      │
     │                           │                              R2 / S3 Storage
 WebSocket status          Signed URLs

* Frontend sends REST calls and listens via WebSocket for job‑status updates.
* Gateway enqueues generation tasks; workers consume, run Stable Diffusion XL + LoRA, composite layers, upload final assets.
* Object storage (Cloudflare R2) holds uploads and outputs; presigned URLs returned to client.

## 2 Service Responsibilities
| Service | Tech | Responsibilities |
|---|---|---|
| Frontend | Next.js 14 + Tailwind | Upload UI, wizard, live canvas (Fabric.js), auth flow. |
| Gateway API | Node 20, Express, BullMQ | REST & WS endpoints, JWT verification, queue jobs, generate presigned URLs, Stripe webhooks. |
| AI Worker | Python 3.11, FastAPI | Load SDXL + style LoRA, face‑crop (InsightFace), seed‑jitter uniqueness, composite 1280×720 + 3000×3000 + PSD. |
| Auth | Clerk (magic‑link) | Issue JWT, handle email verification. |
| Storage/CDN | Cloudflare R2 + CDN | Store uploads, previews, downloads. |
| Database | PostgreSQL (Supabase) | users, styles, generations, brand_kits, audit_log. |
| CI/CD | GitHub Actions → ArgoCD | Build Docker images, deploy to K8s, run Playwright e2e. |

## 3 Key API Routes
POST /api/upload           → { uploadUrl, fileKey }
POST /api/generate         → { generationId }
GET  /api/generation/:id   → { status, previewUrl, downloadUrls[] }
POST /api/title/refine     → { original, refined }
POST /api/title/suggest    → { suggestions[3] }

## 4 Generation Data Flow
/upload: Client uploads host + guest images via presigned URLs; receives fileKeys.
/generate: Client sends styleId, realism, title, fileKeys ⇒ Gateway inserts generations row (status = pending) & enqueues job.
Worker: 
   a. Crop/clean faces → temp PNGs. 
   b. Compose prompt from style preset + realism. 
   c. Run SDXL (seed = UUID ⊕ rand). 
   d. Composite faces & text layers. 
   e. Save 1280×720, 3000×3000, layered PSD. 
   f. Upload to R2, mark DB status = ready, persist URLs.
Gateway emits generation:ready WebSocket event to client.
Client fetches URLs → renders preview & allows download.

## 5 Database Schema (simplified)
users(id uuid pk, email text, created_at timestamptz)
styles(id serial pk, name text, prompt_template text)
generations(id uuid pk, user_id uuid fk, style_id int fk,
            realism int, title text, seed int,
            host_key text, guest_keys text[], status text,
            preview_url text, download_url text, created_at timestamptz)
brand_kits(id uuid pk, user_id uuid fk, logo_url text,
           font text, primary_hex text, secondary_hex text)
audit_log(id serial pk, user_id uuid, action text, meta jsonb, ts timestamptz)

## 6 Performance & Scaling Targets
| Metric | Target |
|---|---|
| Generation latency (p95) | ≤ 30 s |
| Concurrent jobs burst | 100 |
| Front‑end time‑to‑interact (3G) | ≤ 2 s |
| Uptime | 99.5 % |

## 7 Security & Compliance
* All uploads virus‑scanned & passed through AWS Rekognition "unsafe" detector.
* SDXL safety checker on outputs; regenerate on violation.
* GDPR: users may delete account → cascading file deletion (R2 lifecycle rule, DB purge).
* Signed URLs expire after 24 h; private bucket default.

## 8 Monitoring & Logging
| Tool | Metric |
|---|---|
| Sentry | JS and API error tracking |
| Datadog | API latency, GPU utilization, queue depth |
| PostHog | Funnel events: upload, generate, download |

## 9 CI/CD Pipeline
Pull Request → unit tests + ESLint. 
Build Docker images (frontend, gateway, worker) → push GHCR. 
ArgoCD auto‑sync to staging namespace. 
Playwright e2e; on green → promote to prod namespace. 

Prepared by: AIP Engineering  |  Updated 05 May 2025 