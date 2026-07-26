-- O ImgChest agrupa cada upload em um post. Como o ARCA envia uma imagem por
-- requisicao, a API exige excluir o post (e nao o arquivo unico) na limpeza.
alter table public.profiles
  add column if not exists avatar_imgchest_post_id text;

alter table public.post_images
  add column if not exists imgchest_post_id text;

alter table public.profiles
  add constraint profiles_avatar_imgchest_post_id_format
  check (avatar_imgchest_post_id is null or avatar_imgchest_post_id ~ '^[A-Za-z0-9]+$');

alter table public.post_images
  add constraint post_images_imgchest_post_id_format
  check (imgchest_post_id is null or imgchest_post_id ~ '^[A-Za-z0-9]+$');

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
    select 1 from public.posts
    where id = p_post_id and deleted_at is null
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
      post_id, image_url, thumbnail_url, imgchest_image_id,
      imgchest_post_id, alt_text, position
    ) values (
      p_post_id, item->>'imageUrl', nullif(item->>'thumbnailUrl', ''),
      nullif(item->>'imageId', ''), nullif(item->>'postId', ''),
      coalesce(nullif(trim(item->>'altText'), ''), 'Imagem da publicacao'),
      item_position
    );
    item_position := item_position + 1;
  end loop;
end;
$$;
