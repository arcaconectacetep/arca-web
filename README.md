# ConectaCETEP

Rede social acadêmica responsiva para estudantes, professores e gestores da Educação Profissional e Tecnológica em Itaberaba, Bahia. O protótipo centraliza comunicação escolar, aprendizagem, oportunidades e um canal privado de acolhimento.

## Funcionalidades

- Landing page, cadastro, login, recuperação e redefinição de senha com Supabase Auth.
- Onboarding obrigatório com curso, username único, tema e preferências de acessibilidade.
- Feed com busca, filtros e paginação server-side de 10 itens, publicações fixadas, categorias, imagens reordenáveis e editáveis, curtidas e comentários.
- Espaço Pedagógico, Mural e Tendências com pontuação `curtidas + comentários × 2`.
- Canal de suporte privado em três etapas, confirmação final, protocolo, histórico e limite de 3 envios/hora.
- Notificações internas e painel administrativo para usuários, posts, alertas e auditoria.
- RLS em todas as tabelas, proteção Turnstile no Auth, bloqueio contra autoelevação de papel e contas suspensas.
- Upload server-only de JPEG, PNG e WebP para o ImgChest (sem Supabase Storage ou base64).
- Temas Azul, Aurora e Neutro; alto contraste, redução de movimento e fonte 100/115/130%.

## Tecnologias

Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS, Supabase Auth/PostgreSQL, Zod, React Hook Form, Lucide, date-fns e Sonner.

## Instalação

```bash
npm install
cp .env.example .env.local
npm run dev
```

A aplicação abre em `http://localhost:3000`.

## Variáveis de ambiente

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
IMG_CHEST_API_KEY=
DIRECT_CONNECTION_STRING=
DEMO_USER_PASSWORD=
DEMO_STUDENT_EMAIL=student.demo@example.com
DEMO_TEACHER_EMAIL=teacher.demo@example.com
DEMO_STAFF_EMAIL=staff.demo@example.com
DEMO_ADMIN_EMAIL=admin.demo@example.com
```

`SUPABASE_SECRET_KEY`, `IMG_CHEST_API_KEY`, `DIRECT_CONNECTION_STRING` e `DEMO_USER_PASSWORD` são segredos exclusivamente locais/servidor. Nunca use prefixo `NEXT_PUBLIC_` neles. A Vercel não precisa das variáveis `DIRECT_CONNECTION_STRING` ou `DEMO_*` para executar a aplicação. Gere o token do ImgChest em Profile → Security → Personal Access Tokens.

## Cloudflare Turnstile

Crie um widget Turnstile para os domínios local e de produção e salve apenas a Site Key em `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. No Supabase Dashboard, acesse Authentication → Bot and Abuse Protection, escolha Cloudflare Turnstile e configure a Secret Key diretamente no Supabase. A Secret Key do Turnstile não é necessária na aplicação nem na Vercel: login, cadastro e recuperação encaminham o token ao Supabase, que realiza a validação.

## Supabase: migrations e seed

Crie um projeto Supabase e configure as variáveis. Aplique as migrations remotas exatamente com:

```bash
set -a
. ./.env.local
set +a
npx supabase db push --db-url "$DIRECT_CONNECTION_STRING"
```

Execute o seed separadamente:

```bash
set -a
. ./.env.local
set +a
psql "$DIRECT_CONNECTION_STRING" -X -v ON_ERROR_STOP=1 -f supabase/seed.sql
```

Em redes sem IPv6, use a connection string do Session Pooler exibida em Supabase → Connect no lugar da conexão direta.

Para banco local com Docker:

```bash
npx supabase start
npx supabase db reset
```

As migrations criam enums, tabelas, índices, constraints, gatilhos, RLS e regras de negócio. O seed adiciona os sete cursos.

## Usuários e dados de demonstração

Depois do seed, defina uma senha local de pelo menos 12 caracteres em `DEMO_USER_PASSWORD` e execute:

```bash
npm run demo:users
```

O script usa exclusivamente a Supabase Admin API no servidor, confirma os e-mails de demonstração, conclui seus perfis e atribui `STUDENT`, `TEACHER`, `STAFF` e `ADMIN`. Ele é idempotente: contas existentes são reaproveitadas sem trocar suas senhas. Depois disso, papéis são gerenciados em `/admin/usuarios`.

## ImgChest

A integração está isolada em `src/services/imgchest.ts`. Ela usa o endpoint oficial `POST https://api.imgchest.com/v1/post`, autenticação Bearer e multipart `images[]`. O servidor revalida MIME e tamanho, normaliza `data.images[0]` e aceita somente URLs `https://cdn.imgchest.com/files/`. Avatares aceitam 5 MB e posts, 10 MB por imagem, até quatro. Arquivos acima de 4 MB são otimizados no navegador antes do envio para respeitar o limite de payload das Vercel Functions; o arquivo original nunca é convertido para base64 nem persistido localmente.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run demo:users
npm run validate:rls
npm start
```

Para iniciar e realizar o roteiro completo:

```bash
npm run dev
```

Abra `http://localhost:3000` e siga [docs/VALIDATION_CHECKLIST.md](docs/VALIDATION_CHECKLIST.md), registrando os resultados de cada item.

Para validar automaticamente as políticas críticas contra o Supabase configurado, sem desativar o Turnstile:

```bash
npm run validate:rls
```

O script cria contas temporárias por meio da Admin API, autentica por link de uso único, verifica isolamento dos alertas, notas internas, privilégios e suspensão, e remove os dados temporários ao terminar.

## Rotas

Públicas: `/`, `/sobre`, `/proposta`, `/governanca`, `/login`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha`, `/termos`, `/privacidade`.

Autenticadas: `/onboarding`, `/inicio`, `/espaco`, `/mural`, `/tendencias`, `/publicacao/[id]`, `/suporte`, `/suporte/novo`, `/suporte/[id]`, `/notificacoes`, `/perfil/[username]`, `/configuracoes`.

Equipe: `/admin`, `/admin/usuarios`, `/admin/publicacoes`, `/admin/alertas`, `/admin/logs` (logs somente ADMIN).

## Papéis e permissões

- `STUDENT`: feed, posts comuns, curtidas, comentários, perfil e próprios protocolos.
- `TEACHER`: permissões de estudante e comunicados/conteúdo pedagógico.
- `STAFF`: moderação e gestão privada de alertas.
- `ADMIN`: gestão de usuários, papéis, moderação e auditoria. O último ADMIN ativo não pode ser rebaixado.

## Estrutura

- `src/app`: rotas, layouts, route handlers e server actions.
- `src/components`: interface, feed, perfil, suporte e administração.
- `src/lib`: clientes Supabase, middleware e validações.
- `src/services`: integrações externas server-only.
- `supabase/migrations`: schema, RLS e gatilhos versionados.
- `supabase/seed.sql`: cursos iniciais.
- `scripts/create-demo-users.ts`: provisionamento seguro das quatro contas de demonstração.
- `scripts/validate-rls.ts`: prova automatizada de políticas críticas em um Supabase real.
- `docs/VALIDATION_CHECKLIST.md`: roteiro manual de segurança, permissões, fluxos e responsividade.
- `docs/ACCESSIBILITY_AUDIT.md`: escopo revisado e testes assistivos que ainda exigem dispositivos reais.
- `docs/REAL_SUPABASE_VALIDATION.md`: evidências, cobertura e limites da validação no banco de homologação.

## Deploy na Vercel

Importe o repositório na Vercel, configure todas as variáveis, use `npm run build` e atualize `NEXT_PUBLIC_APP_URL` com a URL HTTPS final. No Supabase Auth, adicione essa URL e `/redefinir-senha` às URLs de redirecionamento permitidas.

## Privacidade e limitações do protótipo

Não use dados reais sensíveis na demonstração. Alertas não aceitam anexos nem aparecem no feed; notas internas são restritas por RLS. Imagens públicas são processadas por um serviço externo. O MVP não inclui chat, seguidores, PWA, documentos, WhatsApp ou SMS. Infinite scroll e exclusão remota de imagens do ImgChest ficam fora do escopo do protótipo.
