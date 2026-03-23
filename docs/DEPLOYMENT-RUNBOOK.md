# Deploy Self-Hosted

## Estado atual

- Frontend publicado em `http://45.160.103.198/`
- Backend publicado no mesmo servidor, atrás do `nginx`
- Rotas:
  - `/` -> Angular estático
  - `/api/...` -> ASP.NET Core
- Sem domínio e sem HTTPS no momento

## Repositório

- Workflow: `.github/workflows/azure-static-web-apps-victorious-mud-0d353371e.yml`
- Trigger: `push` em `main` e `workflow_dispatch`
- Secrets exigidos no GitHub:
  - `DEPLOY_SSH_PRIVATE_KEY`
  - `DEPLOY_SUDO_PASSWORD`

## Organização local recomendada

- arquivo local de referência: `.env.local`
- chave SSH operacional: `~/.ssh/inovecode_suporte`
- alias local: `ssh inovecode-prod`

Observações:
- `.env.local` serve para centralizar dados operacionais locais e não é consumido automaticamente pela aplicação
- credenciais operacionais locais, como a senha de `sudo` do usuário `suporte`, devem ficar em `.env.local` ignorado pelo Git
- a cópia principal da chave não deve ficar em `Downloads`
- manter um backup cifrado da chave fora do repositório

## Fluxo de deploy

1. `npm ci --legacy-peer-deps`
2. `npm run build -- --configuration production`
3. empacota `dist/Modernize`
4. envia artefato por `scp` para o servidor
5. cria release em `/var/www/inovesolar-front/releases/<timestamp>`
6. atualiza symlink `/var/www/inovesolar-front/current`
7. valida e recarrega `nginx`

## Estrutura no servidor

- root servido: `/var/www/inovesolar-front/current/browser`
- releases: `/var/www/inovesolar-front/releases`
- proxy reverso: `/etc/nginx/sites-available/inovecode-back`

## Dependência de backend

- Base atual do frontend: `http://45.160.103.198/`
- Definida em `src/app/app.constants.ts`
- Se backend mudar de host, este arquivo e a pipeline devem ser revisados em conjunto
- Em execução local (`localhost`/`127.0.0.1`), o frontend já aponta automaticamente para `http://localhost:5000/`

## Validação mínima após deploy

- abrir `http://45.160.103.198/`
- confirmar retorno `200` de `/`
- validar login real contra `/api/Login/v1`
- se houver erro de API, revisar antes:
  - `nginx`
  - serviço `inovecode-back`
  - roteamento `/api` no `nginx`

## Observações operacionais

- A aplicação está em HTTP puro; isso é aceitável só como estado provisório
- Para HTTPS válido, é necessário apontar um domínio para o IP do servidor
- O frontend foi migrado de Azure Static Web Apps para VPS própria; documentação antiga que mencionar Azure para deploy do frontend está desatualizada
