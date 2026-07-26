# ConectaARCA

> Plataforma acadêmica de informação, aprendizagem e acolhimento para a comunidade da Educação Profissional e Tecnológica.

O **ConectaARCA** é uma aplicação web responsiva que reúne comunicação escolar, conteúdos pedagógicos, oportunidades, projetos estudantis e um canal privado de suporte. O sistema foi desenvolvido como protótipo acadêmico funcional, com município de referência em **Itaberaba, Bahia**, idioma inicial em português do Brasil e arquitetura preparada para demonstração em ambiente real.

Este repositório contém a aplicação Next.js, as migrations PostgreSQL, as políticas de Row Level Security (RLS), o provisionamento de usuários de demonstração e os roteiros de validação funcional, de segurança e acessibilidade.

> **Classificação do projeto:** protótipo acadêmico. Não utilizar relatos reais, dados pessoais sensíveis ou informações institucionais sigilosas sem governança, avaliação jurídica e procedimentos formais de operação.

## Sumário

- [Objetivos e escopo](#objetivos-e-escopo)
- [Funcionalidades](#funcionalidades)
- [Arquitetura e tecnologias](#arquitetura-e-tecnologias)
- [Segurança, privacidade e LGPD](#segurança-privacidade-e-lgpd)
- [Papéis e permissões](#papéis-e-permissões)
- [Requisitos](#requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Configuração do Supabase](#configuração-do-supabase)
- [ImgChest e ciclo de vida das imagens](#imgchest-e-ciclo-de-vida-das-imagens)
- [Cloudflare Turnstile](#cloudflare-turnstile)
- [Execução e validação](#execução-e-validação)
- [Usuários de demonstração](#usuários-de-demonstração)
- [Rotas](#rotas)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Implantação na Vercel](#implantação-na-vercel)
- [Limitações e próximos requisitos institucionais](#limitações-e-próximos-requisitos-institucionais)

## Objetivos e escopo

O projeto busca oferecer um ponto único, acessível e confiável para:

1. divulgar comunicados e acontecimentos escolares;
2. compartilhar conteúdos e referências pedagógicas;
3. apresentar notícias de saúde, segurança, cultura e trabalho;
4. dar visibilidade a oportunidades, empreendedorismo e projetos estudantis;
5. acolher e encaminhar situações escolares por um canal privado e rastreável.

O escopo do MVP não inclui chat privado, seguidores, enquetes, PWA, envio de documentos, WhatsApp, SMS ou processamento automatizado de denúncias.

## Funcionalidades

### Acesso e identidade

- Cadastro, confirmação de e-mail, login, logout e recuperação de senha com Supabase Auth.
- Formulários validados no cliente e no servidor, confirmação de senha e controle de visibilidade dos campos sensíveis.
- Proteção contra abuso por Cloudflare Turnstile nos fluxos públicos de autenticação.
- Onboarding obrigatório com nome, username único, curso, turma, turno, biografia, aceite de termos e preferências visuais.
- Bloqueio de acesso para contas suspensas e proteção das rotas por middleware.

### Comunicação e aprendizagem

- Feed paginado, com busca, filtros, publicações fixadas e ordenação pelas mais recentes.
- Criação, edição e exclusão lógica de publicações próprias.
- Até quatro imagens por publicação, com visualização ampliada, texto alternativo, reordenação e remoção.
- Curtidas, comentários, denúncias e moderação.
- Espaço Pedagógico, Mural Informativo e Tendências.
- Tendências ordenadas por `curtidas + comentários × 2`, com data de criação como desempate.

### Acolhimento e suporte

- Formulário privado em etapas, revisão obrigatória e confirmação antes do envio.
- Categorias de bullying, cyberbullying, preconceito, discriminação, assédio, ameaça, acessibilidade, sofrimento emocional e outras situações escolares.
- Protocolo único, urgência, status, responsável, histórico cronológico e limite de três solicitações por usuário a cada hora.
- Notas internas exclusivas para `STAFF` e `ADMIN`.
- Alertas nunca são publicados no feed e não aceitam anexos.

### Administração

- Indicadores de usuários, publicações, comentários e alertas.
- Gestão de usuários, papéis, suspensão, reativação e exclusão de conta.
- Moderação de publicações e consulta de denúncias.
- Priorização, atribuição e atualização atômica de alertas.
- Registro de auditoria para ações administrativas relevantes.
- Proteção contra rebaixamento ou suspensão do último administrador ativo.

### Acessibilidade e experiência

- Interface responsiva para celular, tablet e desktop.
- Navegação por teclado, foco visível, skip link, HTML semântico e mensagens anunciadas por tecnologias assistivas.
- Alto contraste, redução de movimento, escala de fonte e escolha de família tipográfica.
- Modo claro, escuro ou conforme o sistema, com temas visuais independentes.
- Componentes interativos baseados em Radix UI, com foco gerenciado, portais e diálogos acessíveis.

## Arquitetura e tecnologias

| Camada | Tecnologia | Responsabilidade |
|---|---|---|
| Interface | Next.js 15, React 19, Tailwind CSS e Radix UI | App Router, Server Components, responsividade e acessibilidade |
| Validação | TypeScript strict, Zod e React Hook Form | Contratos tipados e validação em ambas as extremidades |
| Aplicação | Server Actions e Route Handlers | Autorização, mutações sensíveis, cache e integração externa |
| Identidade | Supabase Auth e `@supabase/ssr` | Sessão, cadastro, login e recuperação de senha |
| Dados | Supabase PostgreSQL | Persistência, constraints, triggers, funções e RLS |
| Imagens | ImgChest API | Hospedagem de avatares e mídia pública |
| Proteção | Cloudflare Turnstile | Redução de abuso nos fluxos de autenticação |
| Interface auxiliar | Lucide, date-fns e Sonner | Ícones, datas localizadas e feedback visual |

Fluxo simplificado de uma operação autenticada:

```text
Navegador → Middleware → Server Action/Route Handler → Supabase Auth
                                                ├── PostgreSQL + RLS
                                                └── ImgChest (quando há imagem)
```

O cliente nunca recebe a chave secreta do Supabase, a chave do ImgChest, a senha do banco ou a senha dos usuários de demonstração.

## Segurança, privacidade e LGPD

O MVP aplica controles técnicos compatíveis com o nível de risco do protótipo:

- RLS habilitada nas tabelas e funções auxiliares pequenas, auditáveis e com `search_path` explícito.
- Papel obtido do perfil autenticado; o servidor nunca confia em papel enviado pelo navegador.
- Papel padrão `STUDENT` e proteção contra autoelevação.
- Isolamento de alertas: o autor acessa apenas os próprios relatos; `STAFF` e `ADMIN` tratam os casos.
- Notas internas invisíveis ao estudante e notificações sem detalhes sensíveis.
- Exclusão lógica para conteúdo moderável e exclusão definitiva de conta com cascatas controladas.
- Auditoria de alterações administrativas relevantes.
- Validação de MIME, tamanho, quantidade e hostname das imagens.
- Turnstile em cadastro, login, recuperação e confirmação de exclusão da própria conta.
- Mensagens públicas que evitam revelar existência de contas ou detalhes internos.

Princípios adotados: minimização, finalidade, controle de acesso, rastreabilidade e transparência. O canal de suporte não substitui serviços de emergência, atendimento psicológico, conselho tutelar ou procedimento institucional formal.

Consulte também:

- [Política de privacidade da aplicação](src/app/(public)/privacidade/page.tsx)
- [Auditoria de acessibilidade](docs/ACCESSIBILITY_AUDIT.md)
- [Validação no Supabase real](docs/REAL_SUPABASE_VALIDATION.md)
- [Roteiro completo de validação](docs/VALIDATION_CHECKLIST.md)

## Papéis e permissões

| Capacidade | STUDENT | TEACHER | STAFF | ADMIN |
|---|:---:|:---:|:---:|:---:|
| Visualizar feed e perfis ativos | Sim | Sim | Sim | Sim |
| Criar publicação comum | Sim | Sim | Sim | Sim |
| Curtir e comentar | Sim | Sim | Sim | Sim |
| Publicar conteúdo pedagógico | — | Sim | Sim | Sim |
| Criar comunicado autorizado | — | Sim | Sim | Sim |
| Enviar e acompanhar suporte próprio | Sim | Sim | Sim | Sim |
| Visualizar e tratar alertas | — | — | Sim | Sim |
| Adicionar nota interna | — | — | Sim | Sim |
| Moderar conteúdo | — | — | Sim | Sim |
| Gerenciar usuários e papéis | — | — | — | Sim |
| Consultar logs de auditoria | — | — | — | Sim |

Nenhum usuário pode alterar o próprio papel. O último `ADMIN` ativo possui proteção adicional no banco e na aplicação.

## Requisitos

- Node.js 20 ou superior.
- npm 10 ou superior.
- Projeto Supabase com acesso às configurações de Auth e ao PostgreSQL.
- Token pessoal da API do ImgChest.
- Widget Cloudflare Turnstile configurado no Supabase.
- PostgreSQL client (`psql`) para executar o seed pela linha de comando.
- Docker somente se o Supabase for executado localmente.

## Configuração do ambiente

Instale as dependências e crie o arquivo local:

```bash
npm install
cp .env.example .env.local
```

Variáveis disponíveis:

| Variável | Ambiente | Obrigatória em produção | Finalidade |
|---|---|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente e servidor | Sim | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Cliente e servidor | Sim | Chave pública/publishable do Supabase |
| `SUPABASE_SECRET_KEY` | Somente servidor | Sim | Operações administrativas controladas |
| `NEXT_PUBLIC_APP_URL` | Cliente e servidor | Sim | Origem canônica e redirecionamentos de Auth |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cliente | Sim | Renderização do desafio Turnstile |
| `IMG_CHEST_API_KEY` | Somente servidor | Sim | Upload e exclusão de imagens |
| `DIRECT_CONNECTION_STRING` | Operação local/CI | Não | Migrations e seed; não é usada em runtime |
| `DEMO_USER_PASSWORD` | Operação local | Não | Provisionamento das contas de demonstração |
| `DEMO_*_EMAIL` | Operação local | Não | Endereços das quatro contas de demonstração |

Modelo completo:

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

Nunca versione `.env.local`. Variáveis com `NEXT_PUBLIC_` são incluídas no bundle do navegador; portanto, **jamais** use esse prefixo em segredos. Se uma chave for exposta, revogue-a no provedor e substitua-a em todos os ambientes.

## Configuração do Supabase

### 1. Autenticação

No Dashboard do Supabase:

1. acesse **Authentication → URL Configuration**;
2. defina a URL pública da aplicação como Site URL;
3. adicione as URLs local e de produção em Redirect URLs;
4. inclua especialmente `/onboarding` e `/redefinir-senha`;
5. mantenha confirmação de e-mail habilitada para o fluxo demonstrado pelo projeto.

Exemplos:

```text
http://localhost:3000/onboarding
http://localhost:3000/redefinir-senha
https://seu-dominio.gov.br/onboarding
https://seu-dominio.gov.br/redefinir-senha
```

### 2. SMTP e templates

Os modelos em `supabase/templates/` correspondem a confirmação de cadastro, recuperação de senha, magic link, convite e alteração de e-mail. Copie o HTML para **Authentication → Email Templates**.

Para demonstração, um SMTP autenticado pode ser utilizado. Para operação institucional, recomenda-se domínio próprio, remetente verificável, SPF, DKIM, DMARC, monitoramento de entrega e provedor transacional. A interface orienta o usuário a consultar Spam, Lixo eletrônico e Promoções quando a mensagem não estiver na caixa principal.

### 3. Migrations

Aplique todas as migrations, na ordem versionada, em um banco vazio ou no ambiente remoto configurado:

```bash
set -a
. ./.env.local
set +a
npx supabase db push --db-url "$DIRECT_CONNECTION_STRING"
```

As migrations criam o schema, enums, índices, constraints, triggers, políticas RLS, funções de negócio, preferências visuais e controle do ciclo de vida da mídia.

| Versão | Responsabilidade principal |
|---|---|
| `202607250001` | Schema inicial e relacionamentos |
| `202607250002` | Políticas RLS e funções de autorização |
| `202607250003` | Triggers e regras de negócio |
| `202607250004` | Endurecimento de segurança e constraints |
| `202607260001` | Exclusão segura de usuários |
| `202607260002` | Preferências de aparência |
| `202607260003` | Gestão atômica de mídia de publicações |
| `202607260004` | Identidade ConectaARCA |
| `202607260005` | Exclusão explícita do último administrador |
| `202607260006` | Ciclo de vida dos posts ocultos do ImgChest |

Em redes sem IPv6, use a connection string do **Session Pooler** exibida em **Supabase → Connect**.

### 4. Seed

Execute separadamente após as migrations:

```bash
set -a
. ./.env.local
set +a
psql "$DIRECT_CONNECTION_STRING" -X -v ON_ERROR_STOP=1 -f supabase/seed.sql
```

O seed inclui os cursos de Informática, Redes de Computadores, Administração, Logística, Segurança do Trabalho, Secretariado e Enfermagem.

Para ambiente local com Docker:

```bash
npx supabase start
npx supabase db reset
```

## ImgChest e ciclo de vida das imagens

A integração está centralizada em `src/services/imgchest.ts` e funciona exclusivamente no servidor.

Fluxo implementado:

1. o navegador valida e otimiza a imagem para envio;
2. o Route Handler autentica o usuário e valida novamente MIME e tamanho;
3. o servidor envia `multipart/form-data` ao endpoint oficial do ImgChest;
4. somente URL pública e identificadores técnicos são persistidos no PostgreSQL;
5. ao trocar ou remover mídia, o servidor exclui o post oculto correspondente no ImgChest.

Regras:

- formatos aceitos: JPEG, PNG e WebP;
- até quatro imagens por publicação;
- imagens de publicação: até 10 MB antes da otimização;
- avatares: até 5 MB antes da otimização;
- nenhum arquivo é persistido em base64 ou no Supabase Storage;
- apenas URLs sob `https://cdn.imgchest.com/files/` são aceitas;
- troca de avatar, remoção de mídia e exclusão definitiva de conta executam limpeza remota;
- exclusão lógica ou ocultação de post preserva a mídia para permitir restauração.

Uploads antigos, realizados antes da migration de ciclo de vida, podem não possuir o identificador do post do ImgChest e exigem limpeza operacional no provedor.

## Cloudflare Turnstile

1. crie um widget para `localhost` e para os domínios de produção;
2. salve a Site Key em `NEXT_PUBLIC_TURNSTILE_SITE_KEY`;
3. no Supabase, acesse **Authentication → Bot and Abuse Protection**;
4. selecione Cloudflare Turnstile e informe a Secret Key diretamente no painel.

A Secret Key do Turnstile não pertence ao `.env.local` nem à Vercel. O navegador envia o token ao Supabase por meio das ações do servidor, e o Supabase valida o desafio.

## Execução e validação

Inicie o desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

Verificações obrigatórias antes de uma entrega:

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
```

Validação automatizada das políticas críticas em um Supabase real:

```bash
npm run validate:rls
```

O script cria identidades temporárias pela Admin API, autentica por link de uso único, verifica isolamento de alertas, notas internas, privilégios e suspensão e remove os dados temporários ao finalizar.

Para a homologação manual, execute a aplicação e siga, na ordem:

1. [Checklist de validação funcional e responsiva](docs/VALIDATION_CHECKLIST.md);
2. [Auditoria de acessibilidade](docs/ACCESSIBILITY_AUDIT.md);
3. [Registro da validação no Supabase real](docs/REAL_SUPABASE_VALIDATION.md).

Não declare um ambiente validado apenas porque lint ou build passaram. Fluxos de e-mail, upload, RLS, responsividade e acessibilidade precisam ser exercitados contra os serviços realmente configurados.

## Usuários de demonstração

Defina `DEMO_USER_PASSWORD` com uma senha local de pelo menos 12 caracteres e execute:

```bash
npm run demo:users
```

O script `scripts/create-demo-users.ts`:

- usa a Supabase Admin API apenas no servidor;
- cria ou reaproveita as contas configuradas;
- confirma os e-mails de demonstração;
- conclui o perfil básico;
- atribui `STUDENT`, `TEACHER`, `STAFF` e `ADMIN` com segurança;
- não grava senhas ou chaves no código.

O script é idempotente e não redefine a senha de uma conta já existente. Depois do provisionamento, papéis podem ser administrados em `/admin/usuarios`.

## Rotas

### Públicas

| Rota | Finalidade |
|---|---|
| `/` | Página inicial institucional |
| `/sobre` | Contexto e apresentação do projeto |
| `/proposta` | Proposta acadêmica |
| `/governanca` | Diretrizes de governança |
| `/login` | Autenticação |
| `/cadastro` | Criação de conta |
| `/recuperar-senha` | Solicitação de recuperação |
| `/redefinir-senha` | Definição da nova senha |
| `/termos` | Termos de uso |
| `/privacidade` | Política de privacidade |

### Autenticadas

| Rota | Finalidade |
|---|---|
| `/onboarding` | Configuração inicial obrigatória |
| `/inicio` | Feed escolar |
| `/espaco` | Espaço pedagógico |
| `/mural` | Mural informativo |
| `/tendencias` | Projetos, cultura e oportunidades |
| `/publicacao/[id]` | Conteúdo completo e comentários |
| `/suporte` | Protocolos do usuário |
| `/suporte/novo` | Novo relato privado |
| `/suporte/[id]` | Acompanhamento do protocolo |
| `/notificacoes` | Central de notificações |
| `/perfil/[username]` | Perfil público |
| `/configuracoes` | Perfil, aparência, segurança e conta |

### Administração

| Rota | Acesso |
|---|---|
| `/admin` | STAFF e ADMIN, conforme os dados exibidos |
| `/admin/usuarios` | ADMIN |
| `/admin/publicacoes` | STAFF e ADMIN |
| `/admin/alertas` | STAFF e ADMIN |
| `/admin/alertas/[id]` | STAFF e ADMIN |
| `/admin/logs` | ADMIN |

## Estrutura do repositório

```text
src/
├── app/                    rotas, layouts, Server Actions e Route Handlers
├── components/             interface, feed, perfil, suporte e administração
├── lib/                    Supabase, validações, consultas e utilitários
├── services/               ImgChest, notificações e auditoria
└── types/                  contratos TypeScript
supabase/
├── migrations/             evolução versionada do PostgreSQL e da RLS
├── templates/              templates de e-mail do Supabase Auth
└── seed.sql                dados iniciais não sensíveis
scripts/
├── create-demo-users.ts    provisionamento das quatro contas de demonstração
└── validate-rls.ts         validação automatizada das políticas críticas
docs/
├── VALIDATION_CHECKLIST.md roteiro de homologação manual
├── ACCESSIBILITY_AUDIT.md  auditoria e testes assistivos
└── REAL_SUPABASE_VALIDATION.md evidências da validação remota
```

## Implantação na Vercel

1. importe o repositório na Vercel;
2. mantenha o framework preset como Next.js;
3. configure as variáveis obrigatórias de produção;
4. use `npm run build` como Build Command;
5. defina `NEXT_PUBLIC_APP_URL` com a URL HTTPS canônica, sem barra final;
6. atualize Site URL e Redirect URLs no Supabase;
7. adicione o domínio ao widget Turnstile;
8. valide SMTP, templates e entrega de e-mail;
9. execute o checklist de homologação no domínio publicado.

Variáveis que **não** precisam ser cadastradas na Vercel: `DIRECT_CONNECTION_STRING`, `DEMO_USER_PASSWORD` e `DEMO_*_EMAIL`. Elas são destinadas à operação local ou a um pipeline administrativo controlado.

Antes de promover uma versão:

```bash
npm run lint
npm run typecheck
npm run build
npm run validate:rls
```

Depois do deploy, realize ao menos um teste real de cadastro, confirmação de e-mail, login, upload, remoção de imagem e isolamento do canal de suporte.

## Limitações e próximos requisitos institucionais

O ConectaARCA demonstra os fluxos e controles essenciais, mas uma implantação oficial exige decisões organizacionais adicionais:

- controlador e operadores de dados formalmente definidos;
- base legal, avisos de privacidade e termos aprovados pela instituição;
- prazos de retenção e descarte para alertas, auditoria e notificações;
- fluxo de triagem, responsáveis, horários de atendimento e escalonamento;
- plano de resposta a incidentes e canal para titulares de dados;
- SMTP institucional com domínio verificado e monitoramento de entrega;
- backups, restauração, observabilidade e alertas operacionais;
- testes de acessibilidade com pessoas usuárias e tecnologias assistivas reais;
- revisão independente de segurança antes do uso com dados reais;
- política de moderação, capacitação da equipe e registro de decisões.

Imagens das páginas institucionais são meramente ilustrativas e não representam participantes, estudantes, profissionais ou instituições vinculadas ao projeto.

## Licença e uso

Projeto acadêmico. A definição de licença, titularidade, responsáveis institucionais e autorização de uso em produção deve ocorrer antes de qualquer distribuição oficial.
