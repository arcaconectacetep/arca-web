import type { LucideIcon } from "lucide-react";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { PublicFooter } from "@/components/layout/public-footer";
import { createClient } from "@/lib/supabase/server";
import { Accordion } from "radix-ui";
import { ChevronDown } from "lucide-react";

export type LegalSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export async function LegalPage({
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
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const returnHref = user ? "/inicio" : "/cadastro";

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
          <BrandLogo />
          <Link className="btn-ghost" href={returnHref}>
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">
              {user ? "Voltar ao início" : "Voltar ao cadastro"}
            </span>
            <span className="sm:hidden">Voltar</span>
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
            <Accordion.Root type="single" collapsible className="mt-6 rounded-xl bg-paper p-4 shadow-quiet lg:hidden">
              <Accordion.Item value="contents"><Accordion.Header><Accordion.Trigger className="flex min-h-11 w-full items-center justify-between text-left text-sm font-bold">Nesta página<ChevronDown className="size-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" /></Accordion.Trigger></Accordion.Header><Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"><ul className="mt-3 space-y-1 border-t border-line pt-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a className="block min-h-11 py-2.5 text-sm text-muted" href={`#${section.id}`}>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul></Accordion.Content></Accordion.Item>
            </Accordion.Root>
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

            <div className="mt-4 flex flex-col gap-5 border-t border-line py-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-lg text-sm leading-6 text-muted">
                Transparência faz parte do cuidado. Consulte este documento sempre que precisar.
              </p>
              <Link
                className="btn-primary shrink-0"
                href={returnHref}
              >
                {user ? "Acessar plataforma" : "Continuar cadastro"}
              </Link>
            </div>
          </article>
        </div>
      </main>

      <PublicFooter authenticated={Boolean(user)} />
    </div>
  );
}
