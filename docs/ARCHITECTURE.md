# Arquitetura Técnica

## 1. Visão de alto nível

Aplicação SPA Angular com dois contextos de layout:
- `Blank`: autenticação e páginas públicas
- `Full`: aplicação autenticada (dashboard, administração, notificações)

A aplicação é bootstrapada via `bootstrapApplication` com `ApplicationConfig` (standalone, sem `AppModule`).

## 2. Bootstrapping e providers

Arquivos:
- `src/main.ts`
- `src/app/app.config.ts`

Providers centrais:
- Router (`provideRouter`)
- HTTP (`provideHttpClient(withInterceptorsFromDi())`)
- Interceptors globais
- i18n (`TranslateModule`)
- Toastr
- Material Date Adapter (`pt-BR`)
- Calendar e Highlight

## 3. Roteamento e navegação

Arquivo principal: `src/app/app.routes.ts`

Estratégia:
- rota raiz com `FullComponent` protegida por `AuthGuard`
- lazy loading para `administrator` e `dashboard`
- rota standalone para `notifications`
- layout `BlankComponent` para `authentication/login`
- fallback `notfound` + wildcard

Rotas de domínio:
- `src/app/pages/administrator/administrator.routes.ts`
- `src/app/pages/dashboard/dashboard.routes.ts`
- `src/app/pages/authentication/authentication.routes.ts`

## 4. Segurança, sessão e autorização

Componentes-chave:
- `src/app/auth.guard.ts`
- `src/app/interceptors/auth-header.interceptor.ts`
- `src/app/interceptors/global-error.interceptor.ts`
- `src/app/pages/authentication/auth.service.ts`

Fluxo:
1. Login chama endpoint `baseLogin`.
2. Se autenticado, grava em `localStorage`: `token`, `userId`, `user`, `menu`.
3. `AuthGuard` valida JWT por expiração.
4. Interceptor injeta headers em requisições.
5. Em `401/403`, interceptor global exibe aviso e executa logout.

## 5. Organização de pastas

Raiz funcional:
- `src/app/layouts`: shell visual
- `src/app/pages`: features por domínio
- `src/app/services`: serviços compartilhados
- `src/app/interceptors`: HTTP cross-cutting
- `src/app/shared`: base reutilizável de CRUD
- `src/assets`: estilos, imagens, i18n

## 6. Padrão de CRUD administrativo

Base genérica:
- `src/app/shared/base-crud.component.ts`

Padrão por entidade:
1. `*.component.ts` herda `BaseCrudComponent<T>`
2. `*.service.ts` encapsula endpoints
3. `*-dialog-content.component.ts` faz Add/Update/Delete
4. tabela Material com `MatTableDataSource`, paginação e filtro

Domínios que seguem esse padrão:
- Usuários
- Perfis
- Páginas
- Usinas

## 7. UI, tema e internacionalização

Tema/SCSS:
- entrada global: `src/assets/scss/style.scss`
- variáveis: `src/assets/scss/theme-variables/*`
- cores por tema: `src/assets/scss/themecolors/*`
- overrides Material: `src/assets/scss/override-component/*`

i18n:
- arquivo principal: `src/assets/i18n/pt-BR.json`
- uso em componentes com `TranslateService` e pipe `translate`

## 8. Integração e deploy

Config build:
- `angular.json` (projeto `Modernize`, output `dist/Modernize`)

Deploy:
- Azure Static Web Apps via GitHub Actions
- workflow: `.github/workflows/azure-static-web-apps-victorious-mud-0d353371e.yml`

Fallback SPA:
- `src/staticwebapp.config.json`
- `netlify.toml` também configurado para SPA redirect

## 9. Pontos de atenção arquitetural

- API base está hardcoded em `AppConstants`.
- Menu lateral real vem de `localStorage.menu`; `sidebar-data.ts` é fallback.
- Projeto mescla dados reais e alguns blocos herdados do template base.
- Há forte acoplamento de sessão ao `localStorage`.

