# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-03-23] Frontend repo does not define backend deploy**
   Do instead: confirm backend repository and runtime before preparing server publish steps.
2. **[2026-03-23] Apply minimum-scope changes only**
   Do instead: keep edits local to the affected domain and avoid broad refactors unless explicitly required.

## Domain Behavior Guardrails
1. **[2026-03-23] Preserve standalone Angular patterns**
   Do instead: keep components standalone and use domain services as the single HTTP access layer.
2. **[2026-03-23] Keep UI text in i18n**
   Do instead: add or change user-facing strings in `src/assets/i18n/pt-BR.json` instead of hardcoding them.
3. **[2026-03-23] Respect session coupling**
   Do instead: review `AuthGuard` and HTTP interceptors when changing anything that affects auth or API calls.

## Deployment & Environment
1. **[2026-03-23] Frontend is self-hosted on the same VPS as the backend**
   Do instead: treat `http://45.160.103.198/` as the current production base and preserve `nginx` routing of `/` to Angular and `/api` to ASP.NET.
2. **[2026-03-23] Frontend deploy now runs through GitHub Actions over SSH**
   Do instead: check `.github/workflows/azure-static-web-apps-victorious-mud-0d353371e.yml` and repository secrets `DEPLOY_SSH_PRIVATE_KEY` and `DEPLOY_SUDO_PASSWORD` before changing deployment behavior.
3. **[2026-03-23] Server setup needs sudo credentials**
   Do instead: verify whether the remote user has passwordless sudo before planning package installation or system service changes.

## User Directives
1. **[2026-03-23] Consult project docs first**
   Do instead: use `AGENTS.md`, `docs/PROJECT-KNOWLEDGE-BASE.md`, `docs/ARCHITECTURE.md`, `docs/DOMAINS-API.md`, `docs/AGENT-PLAYBOOK.md`, `docs/CHECKLIST-QUALIDADE.md`, and `docs/DEPLOYMENT-RUNBOOK.md` as the default source of project guidance.
