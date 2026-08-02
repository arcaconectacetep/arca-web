import Link from "next/link";
import { MapPin } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";

export function PublicFooter({ authenticated = false }: { authenticated?: boolean }) {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <BrandLogo className="text-base text-ink" />
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            Comunicação, aprendizagem e acolhimento para a comunidade da
            Educação Profissional e Tecnológica.
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted">
            <MapPin className="size-3.5" /> Itaberaba, Bahia
          </p>
        </div>
        <nav
          aria-label="Links institucionais"
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold"
        >
          <Link className="hover:text-brand" href={authenticated ? "/inicio" : "/login"}>
            {authenticated ? "Acessar plataforma" : "Entrar"}
          </Link>
          <Link className="hover:text-brand" href="/sobre">Sobre</Link>
          <Link className="hover:text-brand" href="/proposta">Proposta</Link>
          <Link className="hover:text-brand" href="/governanca">Governança</Link>
          <Link className="hover:text-brand" href="/termos">
            Termos de Uso
          </Link>
          <Link className="hover:text-brand" href="/privacidade">
            Privacidade
          </Link>
          <CookieSettingsButton />
        </nav>
      </div>
      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-7xl px-5 py-5 text-xs text-muted">
          <span>© 2026 ConectaARCA</span>
        </div>
      </div>
    </footer>
  );
}
