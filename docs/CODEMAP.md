# Code Map (Mapa de Código)

## 1. Root

- `package.json`: scripts e dependências.
- `angular.json`: build/serve/test do projeto `Modernize`.
- `.github/workflows/*`: CI/CD para Azure Static Web Apps.
- `netlify.toml`: fallback SPA (compatibilidade).

## 2. App core (`src/app`)

- `app.config.ts`: providers globais (router/http/i18n/interceptors/material).
- `app.routes.ts`: rotas raiz e composição de layouts.
- `app.constants.ts`: endpoints da API.
- `auth.guard.ts`: bloqueio de rotas protegidas.
- `material.module.ts`: agregador de módulos Angular Material.

## 3. Infra transversal

### Interceptors
- `interceptors/auth-header.interceptor.ts`
- `interceptors/global-error.interceptor.ts`

### Services compartilhados
- `services/crud.service.ts`: wrapper HTTP genérico.
- `services/core.service.ts`: opções de layout/tema/idioma.
- `services/nav.service.ts`: rastreamento de URL ativa.

### Reutilização
- `shared/base-crud.component.ts`: base para CRUD de tabela/dialog.

## 4. Layout

- `next/layout/*`: shell autenticado principal.
- `next/shared/*`: modelos e normalização do menu principal.

## 5. Páginas por domínio

### Authentication
- `pages/authentication/auth.service.ts`
- `pages/authentication/models/side-login.auth.ts`
- `next/auth/*`

### Dashboard
- `pages/dashboard/dashboard.service.ts`
- `pages/dashboard/models/dashboard.models.ts`
- `next/pages/dashboard/*`

### Administrator
- `pages/administrator/user/*`
- `pages/administrator/profile/*`
- `pages/administrator/page/*`
- `pages/administrator/solarplant/*`
- `pages/administrator/company/*`
- `next/pages/administrator/*`

### Notification
- `pages/notification/notification.service.ts`
- `next/pages/notifications/*`

### Error
- `pages/error/error.component.ts`

## 6. Assets e estilo

- `assets/i18n/pt-BR.json`: tradução principal.
- `assets/scss/style.scss`: agregador de tema/layout/helpers.
- `assets/scss/override-component/*`: customização Material.
- `assets/images/*`: logos, ícones, backgrounds.

## 7. Arquivos críticos para depuração rápida

- Erro de rota: `src/app/app.routes.ts`
- Erro de sessão/login: `src/app/pages/authentication/auth.service.ts`
- Erro de header auth: `src/app/interceptors/auth-header.interceptor.ts`
- Erro 401/403 global: `src/app/interceptors/global-error.interceptor.ts`
- Erro em CRUDs: `src/app/shared/base-crud.component.ts` + serviço do domínio
- Erro de tema: `src/assets/scss/style.scss` + `src/app/services/core.service.ts`
