-- Substitui, de forma atomica, as associacoes de midia de uma publicacao.
-- A funcao usa as politicas RLS do chamador e nao remove arquivos do ImgChest.
create or replace function public.replace_post_images(
  p_post_id uuid,
  p_images jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item jsonb;
  item_position integer := 0;
begin
  if jsonb_typeof(p_images) <> 'array' or jsonb_array_length(p_images) > 4 then
    raise exception 'Lista de imagens invalida';
  end if;

  if not exists (
    select 1
    from public.posts
    where id = p_post_id
      and deleted_at is null
      and (author_id = auth.uid() or public.is_staff())
  ) then
    raise exception 'Publicacao nao encontrada ou sem permissao';
  end if;

  delete from public.post_images where post_id = p_post_id;

  for item in select value from jsonb_array_elements(p_images)
  loop
    if coalesce(item->>'imageUrl', '') !~ '^https://cdn\.imgchest\.com/files/' or
       (nullif(item->>'thumbnailUrl', '') is not null and
        (item->>'thumbnailUrl') !~ '^https://cdn\.imgchest\.com/files/') or
       length(coalesce(item->>'altText', '')) > 200 then
      raise exception 'Dados de imagem invalidos';
    end if;

    insert into public.post_images (
      post_id,
      image_url,
      thumbnail_url,
      imgchest_image_id,
      alt_text,
      position
    ) values (
      p_post_id,
      item->>'imageUrl',
      nullif(item->>'thumbnailUrl', ''),
      nullif(item->>'imageId', ''),
      coalesce(nullif(trim(item->>'altText'), ''), 'Imagem da publicacao'),
      item_position
    );
    item_position := item_position + 1;
  end loop;
end;
$$;

revoke all on function public.replace_post_images(uuid, jsonb) from public;
grant execute on function public.replace_post_images(uuid, jsonb) to authenticated;
