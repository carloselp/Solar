# Domínios Funcionais e API

## 1. Configuração de endpoints

Arquivo: `src/app/app.constants.ts`

Base URL:
- `https://inovecode-back.azurewebsites.net/`

Principais recursos:
- Login: `api/Login/v1`
- Users: `api/Users/v1`
- Companies: `api/SystemCompanies/v1`
- Profiles: `api/SystemProfiles/v1`
- Pages: `api/SystemPages/v1`
- ProfileUsers: `api/SystemProfileUsers/v1`
- Solarplants: `api/SystemSolarplants/v1`
- Dashboard Solarplant: `api/Dashboard/Solarplant/v1`
- Alerts: `api/Alert/v1`

## 2. Autenticação

Arquivos:
- `src/app/pages/authentication/auth.service.ts`
- `src/app/pages/authentication/models/side-login.auth.ts`
- `src/app/next/auth/next-login.component.ts`

Contrato:
- Request: `{ user_login, access_key }`
- Response: `{ autenticated, accessToken, user, menu }`

Regras:
- `autenticated=true`: grava sessão e redireciona para dashboard
- `autenticated=false`: trata como falha de autenticação
- logout limpa storage e volta para `/login`

## 3. Dashboard Solar

Arquivos:
- `src/app/pages/dashboard/dashboard.service.ts`
- `src/app/pages/dashboard/models/dashboard.models.ts`
- `src/app/next/pages/dashboard/next-dashboard.component.ts`

Endpoints:
- `GET /Medicao?solarplantId&startDate`
- `GET /Geracao?solarplantId&startDate`
- `GET /GeracaoXOutraMedida?solarplantId&startDate&field`
- `GET /Medicao/Historico?solarplantId&startDate&fieldNumber`

Fluxo da tela principal:
1. Carrega lista de usinas.
2. Define primeira usina como padrão.
3. Faz `forkJoin` para métricas e séries principais.
4. Atualiza cards e gráficos.

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
- `src/app/next/pages/notifications/next-notifications.component.ts`

Endpoint:
- `GET /api/Alert/v1?solarplantId&startDate`
- `GET /api/Alert/v1/list?solarplantId&startDate&endDate&type&severity&search`
- `GET /api/Alert/v1/summary?solarplantId&startDate&endDate`
- `GET /api/Alert/v1/dropdown?limit`
- `PUT /api/Alert/v1/{id}/read`
- `PUT /api/Alert/v1/read-all?solarplantId`

Modelo esperado:
- `{ qtd, createdAt, tipo, titulo, descricao, solucao, severidade, usina }`

Modelos do portal principal:
- listagem:
  `{ id, qtd, createdAt, tipo, titulo, descricao, solucao, severidade, usina, isRead, notificado }`
- resumo:
  `{ severity, total }`
- dropdown:
  `{ id, text, time, severity, isRead, usina }`

Regras de UI:
- agrega contagem por severidade (critical/high/medium/low)
- filtra lista por tipo e severidade
- exibe mapa Leaflet fixo para posição da usina
- o portal principal usa `list`, `summary` e `dropdown`
- `read-all` e `/{id}/read` alimentam o badge e o centro de notificações do shell novo

## 5. Administração - visão geral

Roteamento:
- `src/app/next/next.routes.ts`

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
- usuário agora pode ser vinculado a uma empresa via `companyId`
- listagens principais exibem `companyName` quando houver vínculo

## 7. Administração - Empresas

Arquivos:
- `src/app/pages/administrator/company/company.component.ts`
- `src/app/pages/administrator/company/company.service.ts`
- `src/app/pages/administrator/company/company-dialog-content.component.ts`

Endpoint:
- CRUD: `api/SystemCompanies/v1`

Modelo:
- `{ id, name, document, city, state, status }`

Regras:
- empresas são cadastradas no fluxo administrativo, não na tela `Minha Conta`
- o cadastro/edição de usuário consome a lista de empresas para fazer o vínculo por `companyId`

## 8. Administração - Perfis

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

## 9. Administração - Páginas

Arquivos:
- `src/app/pages/administrator/page/page.component.ts`
- `src/app/pages/administrator/page/page.service.ts`
- `src/app/pages/administrator/page/page-dialog-content.component.ts`

Endpoint:
- CRUD: `api/SystemPages/v1`

## 10. Administração - Usinas

Arquivos:
- `src/app/pages/administrator/solarplant/solarplant.component.ts`
- `src/app/pages/administrator/solarplant/solarplant.service.ts`
- `src/app/pages/administrator/solarplant/solarplant-dialog-content.component.ts`

Endpoint:
- CRUD: `api/SystemSolarplants/v1`

Modelo:
- `{ id, name, efficiency, coef_temp, temp_ref, latitude, longitude }`

Observações:
- `latitude` e `longitude` alimentam o mapa de `/notifications`
- os campos ficam disponíveis no cadastro/edição de usinas no fluxo atual

## 11. Minha Conta

Arquivos:
- `src/app/next/pages/account/next-account.component.ts`
- `src/app/next/pages/account/account.service.ts`

Endpoints:
- `GET/PUT /api/Account/v1/me`
- `GET /api/Account/v1/company`
- `GET/PUT /api/Account/v1/preferences`

Regras:
- dados pessoais continuam editáveis
- dados da empresa ficam em modo leitura e são carregados da empresa vinculada ao usuário
- a preferência `whatsappAlerts` permanece sempre desabilitada e persistida como `false`
- o cadastro administrativo de empresas é a única origem de alteração de empresa

## 12. Serviços compartilhados

`src/app/services/crud.service.ts`
- wrapper genérico para `getAll/get/add/update/delete`
- usado pela maior parte dos serviços administrativos

`src/app/services/core.service.ts`
- configurações globais de tema/layout/língua

`src/app/services/nav.service.ts`
- rastreia URL atual para navegação ativa

## 13. Dependências críticas por domínio

- Sessão: `localStorage`
- Tradução: chaves em `pt-BR.json`
- Toastr para feedback de operação
- Material dialogs para fluxo CRUD
