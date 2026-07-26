import type { LucideIcon } from "lucide-react";
import { ArrowLeft, FileText, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export type LegalSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
  icon: LucideIcon;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
          <BrandLogo />
          <Link className="btn-ghost" href="/cadastro">
            <ArrowLeft className="size-4" /> Voltar ao cadastro
          </Link>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-6xl px-5 py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="flex items-center gap-3 text-brand">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft">
                <Icon className="size-5" />
              </span>
              <span className="eyebrow">{eyebrow}</span>
            </div>
            <nav
              className="mt-7 hidden border-l border-line pl-4 lg:block"
              aria-label="Nesta página"
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-muted">
                Nesta página
              </p>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-paper hover:text-brand"
                      href={`#${section.id}`}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <article className="min-w-0">
            <header className="border-b border-line pb-8">
              <h1 className="page-title max-w-2xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {description}
              </p>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-muted shadow-quiet">
                <FileText className="size-3.5" /> Atualizado em {updatedAt}
              </p>
            </header>

            <div className="divide-y divide-line">
              {sections.map((section, index) => (
                <section
                  id={section.id}
                  key={section.id}
                  className="scroll-mt-8 py-9"
                >
                  <div className="grid gap-3 sm:grid-cols-[36px_1fr]">
                    <span
                      className="font-semibold tabular-nums text-brand/60"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-ink">
                        {section.title}
                      </h2>
                      <div className="legal-copy mt-3 space-y-4 text-[15px] leading-7 text-muted">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <footer className="mt-4 rounded-2xl bg-brand p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-bold">
                    Transparência faz parte do cuidado.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/75">
                    Leia estes documentos antes de criar sua conta.
                  </p>
                </div>
              </div>
              <Link
                className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-4 text-sm font-bold text-brand sm:mt-0"
                href="/cadastro"
              >
                Continuar cadastro
              </Link>
            </footer>
          </article>
        </div>
      </main>

      <footer className="border-t border-line bg-paper px-5 py-8 text-center text-sm text-muted">
        <p className="inline-flex items-center gap-2">
          <LockKeyhole className="size-4" /> ConectaCETEP · Itaberaba, Bahia
        </p>
      </footer>
    </div>
  );
}
