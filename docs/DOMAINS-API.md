# Domínios Funcionais e API

## 1. Configuração de endpoints

Arquivo: `src/app/app.constants.ts`

Base URL:
- `https://inovecode-back.azurewebsites.net/`

Principais recursos:
- Login: `api/Login/v1`
- Users: `api/Users/v1`
- Profiles: `api/SystemProfiles/v1`
- Pages: `api/SystemPages/v1`
- ProfileUsers: `api/SystemProfileUsers/v1`
- Solarplants: `api/SystemSolarplants/v1`
- Dashboard Solarplant: `api/Dashboard/Solarplant/v1`
- Alerts: `api/Alert/v1`

## 2. Autenticação

Arquivos:
- `src/app/pages/authentication/auth.service.ts`
- `src/app/pages/authentication/side-login/side-login.component.ts`
- `src/app/pages/authentication/models/side-login.auth.ts`

Contrato:
- Request: `{ user_login, access_key }`
- Response: `{ autenticated, accessToken, user, menu }`

Regras:
- `autenticated=true`: grava sessão e redireciona para dashboard
- `autenticated=false`: trata como falha de autenticação
- logout limpa storage e volta para `/authentication/login`

## 3. Dashboard Solar

Arquivos:
- `src/app/pages/dashboard/dashboard.service.ts`
- `src/app/pages/dashboard/solarplant/solarplant.component.ts`
- `src/app/pages/dashboard/models/dashboard.models.ts`

Endpoints:
- `GET /Medicao?solarplantId&startDate`
- `GET /Geracao?solarplantId&startDate`
- `GET /GeracaoXOutraMedida?solarplantId&startDate&field`
- `GET /Medicao/Historico?solarplantId&startDate&fieldNumber`

Fluxo da tela:
1. Carrega lista de usinas.
2. Define primeira usina como padrão.
3. Faz `forkJoin` para métricas e séries principais.
4. Atualiza cards e gráficos.
5. Em clique de métrica, abre modal com histórico dedicado.

Mapeamento de campos do histórico:
- Corrente: `2`
- Tensão: `3`
- Temp placa: `4`
- Temp ambiente: `5`
- Irradiação: `6`
- Vento: `7`
- Umidade: `8`

## 4. Notificações

Arquivos:
- `src/app/pages/notification/notification.service.ts`
- `src/app/pages/notification/notification.component.ts`

Endpoint:
- `GET /api/Alert/v1?solarplantId&startDate`

Modelo esperado:
- `{ qtd, createdAt, tipo, titulo, descricao, solucao, severidade, usina }`

Regras de UI:
- agrega contagem por severidade (critical/high/medium/low)
- filtra lista por tipo e severidade
- exibe mapa Leaflet fixo para posição da usina

## 5. Administração - visão geral

Roteamento:
- `src/app/pages/administrator/administrator.routes.ts`

Módulos:
- Usuários
- Perfis
- Páginas
- Usinas

Todos seguem padrão de CRUD com diálogo + feedback toast.

## 6. Administração - Usuários

Arquivos:
- `src/app/pages/administrator/user/user.component.ts`
- `src/app/pages/administrator/user/user.service.ts`
- `src/app/pages/administrator/user/user-profile.service.ts`
- `src/app/pages/administrator/user/user-dialog-content.component.ts`

Endpoints:
- Users: CRUD em `api/Users/v1`
- vínculo perfil-usuário: CRUD em `api/SystemProfileUsers/v1`
- troca de senha: `PUT /api/Users/v1/{id}/changepassword`

Regra importante:
- create/update de usuário pode encadear create/update de vínculo de perfil.

## 7. Administração - Perfis

Arquivos:
- `src/app/pages/administrator/profile/profile.component.ts`
- `src/app/pages/administrator/profile/profile.service.ts`
- `src/app/pages/administrator/profile/profile-pages-dialog.component.ts`

Endpoints:
- CRUD: `api/SystemProfiles/v1`
- páginas do perfil:
  - `GET /{id}/pages`
  - `PUT /{id}/pages`

Regra:
- diálogo específico permite marcar permissões por página e salvar em lote.

## 8. Administração - Páginas

Arquivos:
- `src/app/pages/administrator/page/page.component.ts`
- `src/app/pages/administrator/page/page.service.ts`
- `src/app/pages/administrator/page/page-dialog-content.component.ts`

Endpoint:
- CRUD: `api/SystemPages/v1`

## 9. Administração - Usinas

Arquivos:
- `src/app/pages/administrator/solarplant/solarplant.component.ts`
- `src/app/pages/administrator/solarplant/solarplant.service.ts`
- `src/app/pages/administrator/solarplant/solarplant-dialog-content.component.ts`

Endpoint:
- CRUD: `api/SystemSolarplants/v1`

## 10. Serviços compartilhados

`src/app/services/crud.service.ts`
- wrapper genérico para `getAll/get/add/update/delete`
- usado pela maior parte dos serviços administrativos

`src/app/services/core.service.ts`
- configurações globais de tema/layout/língua

`src/app/services/nav.service.ts`
- rastreia URL atual para navegação ativa

## 11. Dependências críticas por domínio

- Sessão: `localStorage`
- Tradução: chaves em `pt-BR.json`
- Toastr para feedback de operação
- Material dialogs para fluxo CRUD

