alter type public.user_theme add value if not exists 'FOREST';
alter type public.user_theme add value if not exists 'OCEAN';
alter type public.user_theme add value if not exists 'WINE';

alter table public.profiles
  add column color_mode text not null default 'SYSTEM'
    check (color_mode in ('LIGHT', 'DARK', 'SYSTEM')),
  add column font_family text not null default 'INTER'
    check (font_family in ('INTER', 'SOURCE_SANS', 'ATKINSON'));
