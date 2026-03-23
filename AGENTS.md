# Guia de Atuação de Agentes - InoveSolar

Este arquivo existe para acelerar o trabalho de qualquer agente (humano ou IA) neste repositório, sem necessidade de reanalisar todo o código.

## 1) Objetivo do projeto

Aplicação web Angular para monitoramento de usinas solares, com:
- autenticação por JWT
- dashboard operacional com gráficos
- administração de usuários/perfis/páginas/usinas
- central de notificações/alertas

## 2) Stack técnica

- Angular 20 (standalone components)
- TypeScript (strict)
- Angular Material + SCSS temático
- ngx-translate (pt-BR)
- ngx-toastr
- ng-apexcharts
- Leaflet

## 3) Ponto de entrada e núcleo

- Bootstrap: `src/main.ts`
- Providers globais: `src/app/app.config.ts`
- Rotas raiz: `src/app/app.routes.ts`
- Layout autenticado: `src/app/layouts/full/full.component.ts`
- Layout público: `src/app/layouts/blank/blank.component.ts`

## 4) Domínios funcionais

- Autenticação: `src/app/pages/authentication`
- Dashboard: `src/app/pages/dashboard`
- Administração: `src/app/pages/administrator`
- Notificações: `src/app/pages/notification`

## 5) API backend (base)

- Definida em: `src/app/app.constants.ts`
- Base atual: `http://45.160.103.198/`
- O frontend e a API rodam no mesmo servidor; rotas `/api/...` passam pelo `nginx`

## 6) Segurança e sessão

- `AuthGuard` protege layout principal
- `AuthHeaderInterceptor` injeta `Authorization` e `UserId`
- `GlobalErrorInterceptor` trata 401/403/5xx e força logout quando necessário
- Sessão armazenada em `localStorage`: `token`, `userId`, `user`, `menu`

## 7) Como escolher onde alterar

- Mudança de navegação/rotas: `src/app/app.routes.ts` ou `.../administrator.routes.ts` / `.../dashboard.routes.ts`
- Mudança de regra de negócio de tela: componente em `src/app/pages/...`
- Integração API de um domínio: `*.service.ts` do domínio
- Visual global/tema: `src/assets/scss/*`
- Mensagens de UI: `src/assets/i18n/pt-BR.json`

## 8) Documentação detalhada (usar sempre)

- Índice geral: `docs/PROJECT-KNOWLEDGE-BASE.md`
- Arquitetura: `docs/ARCHITECTURE.md`
- Domínios e APIs: `docs/DOMAINS-API.md`
- Playbook operacional: `docs/AGENT-PLAYBOOK.md`
- Checklist de qualidade: `docs/CHECKLIST-QUALIDADE.md`
- Runbook de deploy self-hosted: `docs/DEPLOYMENT-RUNBOOK.md`

## 9) Regras práticas para mudanças

- Priorizar mudanças locais no domínio afetado; evitar refactor amplo sem necessidade.
- Preservar padrão standalone e estrutura atual de serviços.
- Manter textos internacionalizados (`pt-BR.json`) quando houver strings de UI.
- Validar efeitos em autenticação/interceptors ao mexer em chamadas HTTP.
- Se alterar CRUD administrativo, revisar fluxo completo: lista -> diálogo -> service -> feedback (`toastr`).
- Sempre que surgir conhecimento novo, persistente e útil sobre o projeto, atualizar a documentação correspondente no mesmo fluxo de trabalho, sem depender de solicitação adicional do usuário.
- Nunca versionar segredos; quando o novo conhecimento envolver credenciais, registrar só o procedimento e manter os valores em arquivos locais ignorados, cofres apropriados ou no servidor.
