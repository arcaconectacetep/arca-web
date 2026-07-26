import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

export function PublicHeader({ authenticated = false }: { authenticated?: boolean }) {
  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5">
        <BrandLogo className="text-[15px] sm:text-base" />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Institucional">
          <Link className="btn-ghost" href="/sobre">Sobre</Link>
          <Link className="btn-ghost" href="/proposta">Proposta</Link>
        </nav>
        <div className="flex items-center gap-2">
          {authenticated ? (
            <Link className="btn-primary" href="/inicio">
              <span className="hidden sm:inline">Acessar plataforma</span>
              <span className="sm:hidden">Abrir</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link className="btn-ghost hidden sm:inline-flex" href="/login">Entrar</Link>
              <Link className="btn-primary" href="/cadastro">Criar conta</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
