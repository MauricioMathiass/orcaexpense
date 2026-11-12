# OrçaFY Expense — Backend

API em Node.js (Express 5) com Prisma e PostgreSQL no **Neon**. O login é do **Neon Auth**
(Better Auth gerenciado): a API só confere o token (JWT) que o frontend envia.

## Como funciona

1. O frontend entra pelo Neon Auth e recebe um JWT (EdDSA, vale 15 min).
2. Cada chamada à API leva `Authorization: Bearer <jwt>`.
3. A API valida a assinatura com a chave pública do Neon (`NEON_AUTH_JWKS_URL`) e o emissor
   (origem de `NEON_AUTH_BASE_URL`). O `sub` do token é o id do usuário.
4. Os dados do usuário ficam no Postgres, sempre filtrados por esse id.

## Configuração

As variáveis vêm do Neon. Nesta pasta (`Backend`, onde ficam o `neon.ts` e o `.neon`), rode:

```bash
neon deploy
```

Isso grava `.env.local` com `DATABASE_URL` (pool), `DATABASE_URL_UNPOOLED` (direta),
`NEON_AUTH_BASE_URL` e `NEON_AUTH_JWKS_URL`. O Backend lê esse arquivo sozinho. Um `Backend/.env`
opcional pode complementar (`PORT`, `CORS_ORIGIN` com os endereços do frontend separados por vírgula).
**Nenhum desses arquivos vai para o git.**

## Executar

```bash
npm install
npm run db:deploy   # cria/atualiza as tabelas no Neon
npm run dev         # http://localhost:3001  (teste em /health)
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | API com reinício automático ao salvar |
| `npm start` | API em modo normal (produção) |
| `npm run db:generate` | gera o cliente do Prisma |
| `npm run db:deploy` | aplica as migrações em `prisma/migrations` (conexão direta) |
| `npm run db:studio` | abre o Prisma Studio para ver as tabelas |

Para mudar o schema: edite `prisma/schema.prisma`, gere o SQL com
`npx dotenv -e .env.local -- prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script`,
salve-o numa nova pasta em `prisma/migrations/` e rode `npm run db:deploy`.

**Leia o SQL gerado antes de aplicar.** O banco do Neon traz uma tabela de exemplo (`playing_with_neon`) que não faz parte do
schema, e o `migrate diff` propõe apagá-la (`DROP TABLE`). Apague essa linha do arquivo: a migração deve conter só o que você mudou.

## Rotas

Todas exigem o cabeçalho `Authorization: Bearer <token>` e respondem JSON.

| Rota | Descrição |
| --- | --- |
| `GET /health` | verificação de funcionamento (sem login) |
| `GET /api/state` | `revision` (versão dos dados), cartões (com compras), despesas, valores de terceiros (com compras) e blocos do usuário |
| `PUT /api/state` | substitui os dados do usuário pelo retrato enviado, numa transação (tudo ou nada). O corpo leva `revision`: a versão que o cliente leu. Responde `{ "revision": n }` |
| `DELETE /api/state` | zera os dados do usuário e avança a versão (a conta, no Neon Auth, permanece) |

**Controle de versão.** Cada usuário tem um número de versão. O `PUT` só vale se `revision` for igual à versão atual
(`0` para quem ainda não gravou nada); senão a API responde **409** (`conflict`) e não altera nada. Assim, a mesma conta
aberta em dois dispositivos nunca se sobrescreve em silêncio: quem salvou primeiro vence, e a outra tela é avisada.
Duas gravações simultâneas com a mesma versão são colocadas em fila no banco: uma passa, a outra leva 409.

Erros vêm como `{ "error": { "code", "message", "details?" } }`, com mensagens em português.

## Segurança

- Token verificado a cada chamada: assinatura, emissor e validade.
- Nada de senha ou e-mail nas tabelas: usuários ficam no Neon Auth.
- Os ids dos registros recebem o id do usuário na frente: dois usuários nunca colidem e ninguém
  sobrescreve a linha de outro.
- `helmet`, CORS restrito a `CORS_ORIGIN`, limite de chamadas por IP e corpo máximo de 1 MB.
- Valores em dinheiro são `Decimal(12,2)` no banco.
- O frontend roda em outro endereço: inclua-o em `CORS_ORIGIN` e, no Neon, em
  `neon neon-auth domain add https://seu-dominio` (localhost já é liberado). Todos os comandos `neon` devem ser rodados nesta pasta.
