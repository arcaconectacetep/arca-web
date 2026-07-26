# Roteiro de validação manual — ConectaCETEP

Use somente homologação e dados fictícios. Para cada item, registre data, navegador, largura, conta, resultado e evidência sem conteúdo sensível.

## Preparação

- [ ] Aplicar migrations em ordem e executar `supabase/seed.sql`.
- [ ] Configurar as variáveis da aplicação e definir `DEMO_USER_PASSWORD` com pelo menos 12 caracteres.
- [ ] Executar `npm run demo:users`; confirmar sete cursos e quatro perfis.
- [ ] Confirmar ausência de erros e segredos no console, HTML e bundle.

## Cadastro, onboarding e login

- [ ] Validar nome, e-mail inválido, senha menor que oito caracteres e campos obrigatórios em `/cadastro`.
- [ ] Criar conta inédita, confirmar e-mail quando habilitado e entrar.
- [ ] Antes do onboarding, confirmar redirecionamento de rotas privadas para `/onboarding`, sem loop.
- [ ] Rejeitar username curto, com maiúsculas/espaços/símbolos ou duplicado; confirmar normalização em minúsculas.
- [ ] Exigir curso e termos; salvar turma, turno, biografia, tema e acessibilidade.
- [ ] Após concluir, confirmar `/inicio`; ao reabrir `/onboarding`, confirmar retorno a `/inicio`.
- [ ] Testar login correto/incorreto, persistência, logout, recuperação e redefinição de senha.

## Usuário suspenso

- [ ] Suspender STUDENT como ADMIN e testar `/inicio`, `/onboarding` e `POST /api/upload`; todos devem bloquear.
- [ ] Confirmar que suspenso não publica, curte ou comenta.
- [ ] Reativar e confirmar acesso sem alteração do papel.

## Feed, publicações e ImgChest

- [ ] Criar post com/sem título; rejeitar conteúdo vazio/acima de 5.000 e título acima de 120 caracteres.
- [ ] Enviar JPEG, PNG e WebP; confirmar preview e URL `cdn.imgchest.com` no banco.
- [ ] Rejeitar MIME inválido, avatar acima de 5 MB, imagem acima de 10 MB e quinta imagem.
- [ ] Confirmar ausência de base64 e da chave ImgChest no cliente.
- [ ] Editar e excluir logicamente post próprio; confirmar fixados antes dos demais.
- [ ] Como STUDENT, tentar alterar diretamente `author_id`, `official`, `pinned`, `hidden_at` e `hidden_by`; esperar proteção.

## Curtidas, comentários e notificações

- [ ] Curtir/descurtir; confirmar unicidade e bloqueio ao informar outro `user_id`.
- [ ] Criar comentário; rejeitar vazio/acima de 1.000 caracteres.
- [ ] Tentar trocar `author_id`, `post_id` e `hidden_at` do comentário; esperar proteção.
- [ ] Confirmar notificações genéricas de curtida/comentário por outra conta e ausência ao interagir consigo.
- [ ] Marcar uma/todas como lidas; tentar adulterar destinatário, tipo, título, corpo e link — somente `read_at` pode mudar.

## Permissões por papel

### STUDENT

- [ ] Visualiza posts, cria post comum, curte, comenta, edita perfil e acompanha próprios alertas.
- [ ] Não cria comunicado/oficial/fixado, nota interna nem ação administrativa.
- [ ] Não altera `role` ou `suspended_at`, inclusive via API direta.

### TEACHER

- [ ] Possui ações de STUDENT e cria conteúdo pedagógico/comunicado autorizado.
- [ ] Não acessa alertas privados, usuários ou logs.

### STAFF

- [ ] Modera conteúdo e acessa/atualiza alertas e notas internas.
- [ ] Não acessa `/admin/usuarios` nem `/admin/logs`.

### ADMIN

- [ ] Acessa dashboard, usuários, posts, alertas e logs; altera papéis, suspende e modera.
- [ ] Confirmar registros correspondentes em `audit_logs`.

## Canal de suporte e privacidade

- [ ] Confirmar aviso de emergência, três etapas, revisão e confirmação final.
- [ ] Exigir categoria, urgência e descrição mínima; não permitir anexos.
- [ ] Enviar e validar protocolo `CCT-AAAA-NNNNNN`; o quarto envio em uma hora deve falhar.
- [ ] Confirmar que alerta não aparece no feed nem expõe detalhes em notificação.
- [ ] Outro STUDENT não consulta alerta/eventos alheios; autor vê somente próprios eventos públicos.
- [ ] Autor não altera descrição, categoria, urgência, autoria, protocolo, status ou responsável.

## Notas internas e status atômico

- [ ] STAFF/ADMIN abre alerta, designa responsável e percorre todos os status.
- [ ] Cada mudança deve produzir, na mesma operação, status, evento cronológico e uma notificação genérica.
- [ ] Em transação de teste com rollback, confirmar ausência de estado/evento/notificação parcial.
- [ ] Adicionar nota interna; confirmar autoria/data e zero linhas ao consultar como estudante.
- [ ] Confirmar que texto da nota não aparece em evento público ou notificação.

## Último ADMIN

- [ ] Com um único ADMIN ativo, tentar rebaixá-lo e suspendê-lo pelo painel e por API autenticada; esperar rejeição.
- [ ] Tentar autoalteração de papel; esperar rejeição.
- [ ] Com dois ADMINs, confirmar rebaixamento válido de um deles e respectivo audit log.

## Responsividade e acessibilidade

Repetir em 360, 390, 768, 1024 e 1440 px:

- [ ] Landing, auth, onboarding, feed, composer, suporte, perfil e admin sem scroll horizontal global.
- [ ] Sidebar somente desktop; barra inferior não cobre conteúdo mobile; tabelas rolam apenas no contêiner.
- [ ] Imagens preservam proporção e textos/protocolos longos quebram corretamente.
- [ ] Testar skip link, ordem de Tab, foco visível, labels e áreas de toque de 44 px.
- [ ] Alto contraste mantém texto, bordas, foco e estados discerníveis sem depender só de cor.
- [ ] Fonte 100%, 115% e 130% produz reflow sem corte/sobreposição.
- [ ] Movimento reduzido da conta e `prefers-reduced-motion` removem movimento não essencial.

## Encerramento

- [ ] Executar `npm run lint`, `npm run typecheck`, `npm run build` e `git diff --check`.
- [ ] Registrar falhas com rota, papel, passos e esperado/obtido.
- [ ] Trocar/remover credenciais de demonstração antes de qualquer uso real.
