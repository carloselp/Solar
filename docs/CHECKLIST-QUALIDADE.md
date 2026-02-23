# Checklist de Qualidade para Mudanças

Use este checklist antes de considerar uma demanda concluída.

## 1. Build e compilação

- [ ] `npm run build` executa sem erro
- [ ] Não há erro de tipagem TypeScript
- [ ] Sem imports quebrados

## 2. Regras de domínio

- [ ] A mudança está no domínio correto (auth/dashboard/admin/notification)
- [ ] Regras de negócio da tela foram preservadas
- [ ] Tratamento de estado de loading foi mantido
- [ ] Tratamento de erro com feedback foi considerado

## 3. API e integração

- [ ] Endpoint correto e consistente com `AppConstants`
- [ ] Parâmetros de query/path corretos
- [ ] Modelos/interfaces coerentes com payload real
- [ ] Fluxo de erro HTTP considerado (401/403/500)

## 4. Segurança e sessão

- [ ] Não expôs token/sessão em logs
- [ ] Não removeu headers de autenticação
- [ ] Não quebrou `AuthGuard`
- [ ] Login e logout continuam funcionais

## 5. UI/UX

- [ ] Responsividade preservada (desktop e mobile)
- [ ] Componentes Material funcionando corretamente
- [ ] Mensagens do usuário traduzidas (`pt-BR.json`)
- [ ] Navegação e breadcrumbs coerentes

## 6. CRUD administrativo (se aplicável)

- [ ] Listagem carrega corretamente
- [ ] Diálogo abre com dados esperados
- [ ] Add funciona e atualiza tabela
- [ ] Update funciona e atualiza tabela
- [ ] Delete funciona e atualiza tabela

## 7. Dashboard/Gráficos (se aplicável)

- [ ] Dados vazios não quebram o gráfico
- [ ] Séries e eixos estão corretos
- [ ] Datas/horários estão coerentes
- [ ] Modal de detalhe abre com conteúdo correto

## 8. Notificações/Mapa (se aplicável)

- [ ] Filtros retornam lista coerente
- [ ] Top cards por severidade conferem com dados
- [ ] Mapa renderiza sem erro

## 9. Documentação

- [ ] Mudança relevante refletida em `docs/`
- [ ] Instruções novas registradas em `AGENTS.md` quando necessário

## 10. Entrega

- [ ] Resumo da mudança descreve arquivos alterados
- [ ] Riscos remanescentes foram explicitados
- [ ] Próximos passos sugeridos (quando fizer sentido)

