# Auditoria de acessibilidade

Data da revisão: 26 de julho de 2026.

## Escopo verificado por código

- Estrutura semântica, link de salto e títulos de página.
- Rótulos de formulários e nomes acessíveis de botões com ícone.
- Estados de foco visível e áreas de toque.
- Diálogos, alertas, menus, selects, checkboxes, accordions e drawer mobile construídos com primitives Radix UI, incluindo foco preso, retorno de foco, `Esc` e navegação por teclado.
- Texto alternativo editável para imagens de publicações.
- Preferências de alto contraste, escala de fonte (100%, 115% e 130%) e movimento reduzido.
- Layouts responsivos sem dependência de informação transmitida apenas por cor.
- `lint`, `typecheck` e compilação de produção.

## Validação manual ainda necessária

Esta revisão não equivale a uma certificação WCAG. Antes do uso institucional, executar em dispositivos reais:

1. Navegar em todas as rotas somente com teclado, verificando ordem e retorno de foco dos diálogos.
2. Testar com TalkBack no Android e VoiceOver no iOS/macOS.
3. Verificar contraste com ferramenta dedicada em todos os temas e modos claro/escuro.
4. Testar zoom de 200% e 400% nas larguras de 360, 390, 768, 1024 e 1440 px.
5. Confirmar anúncios de erros, sucesso, carregamento e atualização dinâmica.
6. Revisar textos alternativos das imagens publicadas por usuários.
7. Validar o formulário de suporte com pessoas que utilizem tecnologia assistiva.

Registrar evidências e defeitos encontrados no roteiro de [validação manual](./VALIDATION_CHECKLIST.md).
