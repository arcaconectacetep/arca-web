# Sistema visual ConectaCETEP

- Direção: editorial acadêmica, calma e institucional; azul tinta sobre superfícies de papel.
- Assinatura: linha de percurso azul que conecta navegação, seções e protocolos.
- Profundidade: sombras muito sutis e bordas de baixo contraste; base de espaçamento 4px.
- Tipografia: Inter em toda a experiência, com pesos e espaçamento mais expressivos nos títulos. Escala 1.25, títulos compactos e corpo confortável.
- Movimento: entradas curtas de 220–280ms, linha de percurso desenhada e microinterações discretas; tudo desativado quando movimento reduzido estiver ativo.
- Densidade: cards 20–24px, controles com no mínimo 44px; sidebar 264px.
- Botão primário: 44px, raio 10px, azul tinta, texto 14px/700.
- Card: raio 16px, papel, borda silenciosa + elevação sutil no hover quando interativo.
- Formulário de autenticação: uma ação principal; campos 44px+, validação junto ao campo, botão de visibilidade com alvo de 48px e requisitos de senha em três segmentos.
- Página legal: índice lateral fixo no desktop, seções numeradas e conteúdo em uma única coluna de leitura; cabeçalho e ação de retorno sempre visíveis no fluxo.
- Publicação: conteúdo abre `/publicacao/[id]`; autor é um alvo separado; ações próprias ficam em menu contextual e estados assíncronos usam spinner de 16–20px.
- Carregamento: skeleton conserva a geometria de avatar, texto e ações do card para evitar salto de layout.
- Navegação mobile: menu lateral de até 320px com backdrop, fechamento por rota e scroll da página bloqueado enquanto aberto.
- Descoberta do feed: busca e categoria em uma barra compacta; paginação server-side de 10 itens preserva filtros e informa página atual/total.
- Segurança de autenticação: Turnstile em superfície inset, antes da ação principal; formulário falha fechado se a Site Key estiver ausente.
