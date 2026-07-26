# Validação no Supabase real

Última execução: 26 de julho de 2026, em ambiente de homologação.

## Migrations confirmadas

As versões abaixo constam em `supabase_migrations.schema_migrations`, na ordem esperada:

1. `202607250001_initial_schema`
2. `202607250002_rls`
3. `202607250003_business_triggers`
4. `202607250004_security_hardening`
5. `202607260001_user_deletion`
6. `202607260002_appearance_preferences`
7. `202607260003_post_media_management`
8. `202607260004_rebrand_conecta_arca`

## Teste automatizado executado

Comando:

```bash
npm run validate:rls
```

Resultado: aprovado em 30 verificações reais, incluindo:

- proteção contra autoelevação e alteração da própria suspensão;
- autoria forçada de posts e comentários;
- comunicado autorizado para TEACHER e negado para STUDENT;
- curtidas, comentários e notificações sociais;
- leitura de notificações sem adulteração de conteúdo;
- gestão atômica de mídia somente pelo autor/equipe;
- isolamento de alertas entre estudantes e bloqueio para TEACHER;
- acesso, status e notas internas para STAFF;
- evento e notificação genérica ao atualizar suporte;
- limite de três solicitações por usuário/hora;
- novos protocolos no formato `ARCA-AAAA-NNNNNN`;
- audit log visível somente para ADMIN;
- moderação de publicação por STAFF;
- bloqueio de publicação por conta suspensa.

O script cria usuários fictícios temporários pela Supabase Admin API, autentica por link de uso único para não contornar a proteção Turnstile, executa consultas como cada papel e remove os registros ao final. Após a execução, foi confirmado `0` perfil temporário com o prefixo de teste.

## Limites desta evidência

- A proteção do último ADMIN permanece no roteiro manual porque testá-la contra os administradores reais exigiria alterar temporariamente privilégios de contas permanentes.
- Cadastro por e-mail, recuperação de senha e Turnstile dependem de interação no navegador e continuam no roteiro manual.
- A CLI do Supabase não oferece binário para Android/Termux; o histórico foi consultado diretamente pelo PostgreSQL com conexão TLS.
- Testes com TalkBack, VoiceOver e dispositivos físicos não foram declarados como executados.

Consulte também o [roteiro completo de validação manual](./VALIDATION_CHECKLIST.md) e a [auditoria de acessibilidade](./ACCESSIBILITY_AUDIT.md).
