# Playbook de Execução para Agentes

## 1. Objetivo

Padronizar como mudanças devem ser implementadas neste projeto para maximizar acerto e minimizar regressão.

## 2. Fluxo padrão de trabalho

1. Classificar a solicitação por domínio:
   - autenticação
   - dashboard
   - administração
   - notificações
   - layout/tema/i18n
2. Identificar arquivos-alvo diretos (componente + service + rota + template).
3. Fazer mudança mínima necessária (evitar refatoração colateral).
4. Validar comportamento localmente.
5. Atualizar documentação quando necessário.

## 3. Mapa de decisão rápida (onde mexer)

- Nova rota de funcionalidade:
  - `src/app/app.routes.ts` ou arquivo de rotas do domínio
- Nova chamada API em domínio existente:
  - `src/app/pages/<dominio>/<dominio>.service.ts`
- Mudança de regra visual da página:
  - `*.component.html`, `*.component.scss`, `*.component.ts`
- Mudança global de tema:
  - `src/assets/scss/*`
- Texto/mensagem:
  - `src/assets/i18n/pt-BR.json`

## 4. Padrões obrigatórios de implementação

- Preservar padrão standalone dos componentes.
- Manter serviços de domínio como ponto único de acesso HTTP.
- Reaproveitar `BaseCrudComponent` em telas administrativas.
- Tratar loading e erros com padrão atual (`isLoading`, `toastr`, `finalize` quando aplicável).
- Manter nomenclaturas compatíveis com backend.

## 5. Checklist de impacto antes de editar

- A mudança afeta sessão/autorização?
- A mudança altera contrato de endpoint?
- A mudança introduz nova chave de tradução?
- A mudança impacta menu/permissões?
- A mudança afeta build/deploy?

## 6. Estratégias por tipo de demanda

### 6.1 Nova feature de dashboard

1. Criar método no `dashboard.service.ts`.
2. Criar/ajustar interface em `models/dashboard.models.ts`.
3. Integrar no componente e refletir em gráfico/card.
4. Garantir fallback para array vazio.

### 6.2 Ajuste de CRUD administrativo

1. Ajustar serviço do domínio.
2. Ajustar componente herdando `BaseCrudComponent`.
3. Ajustar diálogo de edição/criação.
4. Validar fluxo Add/Update/Delete ponta a ponta.

### 6.3 Ajuste de autenticação

1. Revisar `auth.service.ts`.
2. Revisar interceptors (headers e erros).
3. Revisar `AuthGuard`.
4. Validar login, refresh de rota e logout.

## 7. Testes e validação prática

Comandos úteis:
- `npm start`
- `npm run build`
- `npm test`

Validação manual mínima:
- login/logout
- carregamento do dashboard
- ao menos um CRUD administrativo
- tela de notificações

## 8. Atualização de documentação

Toda mudança que altere arquitetura, fluxo ou contrato deve atualizar:
- `docs/ARCHITECTURE.md`
- `docs/DOMAINS-API.md`
- ou ambos

## 9. Erros comuns a evitar

- editar apenas HTML sem alinhar regra no `*.ts`
- adicionar string hardcoded sem i18n
- chamar endpoint direto no componente (sem service)
- quebrar padrão de sessão em `localStorage`
- introduzir dependência nova sem justificar impacto

