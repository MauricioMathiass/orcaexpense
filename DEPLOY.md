# Publicar para teste: Netlify (site) + Render (API) + Neon (banco)

```
Navegador (site no Netlify)
 ├─ login e cadastro ─────────────► Neon Auth      (VITE_NEON_AUTH_URL)
 └─ dados do app ─► API no Render ─► Postgres no Neon   (DATABASE_URL, só na API)
```

O site nunca fala direto com o banco. A string de conexão fica só no Render.

## 0. Antes de tudo: colocar o código no GitHub

Netlify e Render publicam a partir de um repositório. O repositório local ainda não tem remoto.

1. Crie um repositório **privado** vazio no GitHub.
2. Na pasta `OrcaEXPENSE`: `git add -A`, `git commit -m "Primeira versão"`, `git remote add origin <url>` e `git push -u origin master`.
3. Confira antes de enviar: `git status` não deve listar nenhum `.env` ou `.env.local` (eles estão no `.gitignore`).

## 1. Banco (Neon)

As tabelas já existem na branch `production`. Para publicar numa branch nova, aplique as migrações nela:

```bash
cd Backend
npm run db:deploy
```

(lê o `Backend/.env.local`; ele aponta para a branch em que você está).

**Isolar o teste (opcional).** Dentro de `Backend`, `neon checkout teste --create` cria uma branch com banco e usuários próprios
e passa a apontar o seu `.env.local` para ela. Depois rode `neon deploy` e `npm run db:deploy`, e use as
variáveis dessa branch no Render e no Netlify. A branch criada assim expira em 7 dias (regra do `neon.ts`).

## 2. API (Render)

1. Em render.com: **New > Blueprint**, escolha o repositório. O arquivo `render.yaml` já descreve o serviço.
2. Preencha as variáveis que ficam em branco (valores do seu `Backend/.env.local`):

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | a conexão com pool (host com `-pooler`) |
| `NEON_AUTH_BASE_URL` | igual ao `Backend/.env.local` |
| `NEON_AUTH_JWKS_URL` | igual ao `Backend/.env.local` |
| `CORS_ORIGIN` | o endereço do site no Netlify, ex.: `https://meu-site.netlify.app` |

3. Depois do deploy, abra `https://SUA-API.onrender.com/health`: deve responder `{"status":"ok"}`.

No plano gratuito do Render a API "dorme" após alguns minutos parada e a primeira chamada demora cerca de
um minuto. O site mostra "Carregando seus dados..." nesse tempo.

## 3. Site (Netlify)

1. Em netlify.com: **Add new site > Import an existing project**, escolha o repositório.
   O `netlify.toml` já define a pasta, o comando de build e a pasta publicada.
2. Em **Site configuration > Environment variables**, crie:

| Variável | Valor |
| --- | --- |
| `VITE_NEON_AUTH_URL` | a `NEON_AUTH_BASE_URL` do `Backend/.env.local` |
| `VITE_API_URL` | o endereço da API no Render, sem barra no final |

3. Rode o deploy de novo (as variáveis do Vite entram no build; mudar depois exige novo build).

Essas duas são públicas (vão dentro do JavaScript do site). **Nunca** ponha `DATABASE_URL` no Netlify.

## 4. Liberar o site no Neon Auth

Sem isso o login falha com "invalid domain". Rode dentro de `Backend`:

```bash
neon neon-auth domain add https://meu-site.netlify.app
```

## 5. Testar

1. Abra o site, crie uma conta e adicione um cartão.
2. Recarregue a página: o cartão deve continuar lá.
3. Saia e entre de novo.
4. No Neon (SQL Editor): `select email from neon_auth."user";` mostra a conta criada.

## Antes de compartilhar o link com outras pessoas

O que o código já faz: cada pessoa só enxerga os próprios dados; duas telas da mesma conta não se sobrescrevem
(a segunda recebe um aviso de conflito); a API valida o login a cada chamada. O que depende de você:

1. **E-mail próprio no Neon Auth.** Hoje os e-mails (redefinição de senha) saem de `auth@mail.myneon.app`, o remetente
   compartilhado de teste, e podem cair no spam ou ter limite. Em produção o Neon pede um e-mail próprio (SMTP, ex.: Resend):
   `neon neon-auth config email-provider` (rode dentro de `Backend`) e o checklist em
   https://neon.com/docs/auth/production-checklist.md. Teste "Esqueci minha senha" com uma conta real.
2. **Confirmação de e-mail no cadastro.** Está desligada (`Require Verification: false`): qualquer pessoa cria conta com
   e-mail falso. Para teste entre amigos tudo bem; para abrir ao público, ligue com o SMTP próprio:
   `neon neon-auth config email-password`.
3. **Backup.** O histórico de recuperação do seu projeto no Neon é de **6 horas**. Um apagão de dados descoberto depois disso
   não tem volta. Se os dados importam, faça cópias periódicas (`pg_dump` pela conexão direta) ou aumente a retenção
   (plano pago).
4. **Primeira carga lenta.** O Render gratuito dorme após uns 15 minutos sem uso; a primeira pessoa espera até ~1 minuto
   (o site avisa na tela). Soluções: um monitor gratuito que chame `/health` a cada 10 minutos (ex.: UptimeRobot) ou o
   plano pago do Render.
5. **Banco de teste e de uso real são o mesmo.** Quando você roda o app em `localhost`, ele grava no mesmo banco que o site.
   Para separar, crie uma branch de desenvolvimento no Neon (cuidado: pelo `neon.ts`, branches novas expiram em 7 dias).
6. **Privacidade.** São dados financeiros pessoais. Se outras pessoas vão usar, combine com elas o que é guardado e avise
   (política de privacidade simples; LGPD se for público).
7. **Dependências com aviso no `npm audit`.** Revisados: os avisos "críticos/altos" do Frontend são de ferramentas de
   desenvolvimento (Vite, PostCSS) ou de código de servidor do Better Auth que roda no Neon, não no seu site; os do Backend
   são da linha de comando do Prisma. Nenhum atinge o que roda para o usuário. Resolver exige subir versões principais
   (Vite 8, Prisma 7); planeje como uma tarefa à parte, com testes.

## Problemas comuns

| Sintoma | Causa provável |
| --- | --- |
| "invalid domain" ao entrar | falta o passo 4 |
| "Não foi possível carregar seus dados" | `VITE_API_URL` errado, API dormindo ou `CORS_ORIGIN` sem o endereço do site |
| Erro de CORS no console | `CORS_ORIGIN` diferente do endereço real do site (confira `https`, sem barra no final) |
| Funcionou em `localhost` e não no Netlify | faltou refazer o deploy depois de criar as variáveis `VITE_*` |
| Link do e-mail de redefinição não abre o site | o endereço do site não está nos domínios confiáveis (passo 4) |
| Aviso "Seus dados foram alterados em outro dispositivo" | a mesma conta foi salva em outra tela; clique em Recarregar |
| Erro 409/500 logo depois de atualizar a API | falta aplicar a migração nova no banco (`npm run db:deploy` em `Backend`) antes de subir o código |
