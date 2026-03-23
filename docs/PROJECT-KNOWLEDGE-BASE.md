# Base de Conhecimento do Projeto - InoveSolar

Este é o índice principal de conhecimento operacional do projeto.

## Objetivo

Permitir que qualquer agente execute mudanças com precisão, sem precisar remapear o código inteiro a cada tarefa.

## Índice

1. Arquitetura e estrutura técnica:
   `docs/ARCHITECTURE.md`
2. Domínios funcionais e contratos de API:
   `docs/DOMAINS-API.md`
3. Mapa de código por responsabilidade:
   `docs/CODEMAP.md`
4. Playbook de execução de mudanças:
   `docs/AGENT-PLAYBOOK.md`
5. Checklist de qualidade e validação:
   `docs/CHECKLIST-QUALIDADE.md`
6. Deploy e operação self-hosted:
   `docs/DEPLOYMENT-RUNBOOK.md`

## Snapshot técnico rápido

- Framework: Angular 20 (standalone)
- UI: Angular Material + SCSS customizado
- Estado local principal: componentes + serviços + `localStorage`
- i18n: `@ngx-translate/core` com `pt-BR`
- Gráficos: ApexCharts
- Mapa: Leaflet
- Deploy: VPS própria em `45.160.103.198` via GitHub Actions + SSH

## Arquivos de referência primária

- Entrada: `src/main.ts`
- Providers globais: `src/app/app.config.ts`
- Rotas globais: `src/app/app.routes.ts`
- Config de API: `src/app/app.constants.ts`
- Tema/layout: `src/assets/scss/style.scss`
- Traduções: `src/assets/i18n/pt-BR.json`
- Deploy: `.github/workflows/azure-static-web-apps-victorious-mud-0d353371e.yml`

## Princípio de manutenção

Quando houver divergência entre documentação e código, o código é a fonte de verdade. Atualize a documentação no mesmo PR da mudança funcional.
