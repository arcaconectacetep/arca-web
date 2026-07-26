-- Novos protocolos usam somente a identidade publica ARCA.
-- Protocolos emitidos anteriormente permanecem inalterados para preservar
-- a rastreabilidade e os links de acompanhamento já entregues aos autores.
alter table public.support_alerts
  alter column protocol set default (
    'ARCA-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.support_protocol_seq')::text, 6, '0')
  );
