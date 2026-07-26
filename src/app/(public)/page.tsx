import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Lightbulb,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { PublicFooter } from "@/components/layout/public-footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const areas = [
  {
    icon: Users,
    title: "Feed escolar",
    text: "A vida do CETEP em um fluxo claro e participativo.",
  },
  {
    icon: BookOpen,
    title: "Espaço pedagógico",
    text: "Conteúdos e trocas que acompanham cada curso.",
  },
  {
    icon: Megaphone,
    title: "Mural informativo",
    text: "Prazos, campanhas, saúde e segurança em destaque.",
  },
  {
    icon: Lightbulb,
    title: "Tendências",
    text: "Projetos, cultura, tecnologia e oportunidades.",
  },
  {
    icon: HeartHandshake,
    title: "Canal de suporte",
    text: "Acolhimento privado, responsável e rastreável.",
  },
];
const courses = [
  "Informática",
  "Redes de Computadores",
  "Administração",
  "Logística",
  "Segurança do Trabalho",
  "Secretariado",
  "Enfermagem",
];

export default async function Landing() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "ConectaCETEP",
    description: "Rede acadêmica para informação, aprendizagem e acolhimento.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Itaberaba",
      addressRegion: "BA",
      addressCountry: "BR",
    },
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <BrandLogo className="text-[15px] sm:text-base" />
        <nav className="flex items-center gap-2">
          {user ? (
            <Link className="btn-primary" href="/inicio">
              <span className="hidden sm:inline">Acessar plataforma</span>
              <span className="sm:hidden">Abrir</span>
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link className="btn-ghost hidden sm:inline-flex" href="/login">
                Entrar
              </Link>
              <Link className="btn-primary" href="/cadastro">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </header>
      <main id="conteudo">
        <section className="border-y border-line bg-paper">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.15fr_.85fr]">
            <div className="px-5 py-20 sm:py-28 lg:py-32 lg:pr-16">
              <p className="eyebrow mb-5">Comunidade acadêmica · Itaberaba</p>
              <h1 className="reveal max-w-3xl font-display text-5xl font-bold leading-[.98] md:text-7xl">
                Informação, aprendizado e acolhimento em um só espaço.
              </h1>
              <p className="reveal reveal-delay-1 mt-7 max-w-2xl text-lg leading-8 text-muted">
                O ConectaCETEP conecta estudantes, professores e projetos,
                fortalecendo a comunicação, a inclusão e o cuidado dentro da
                comunidade escolar.
              </p>
              <div className="reveal reveal-delay-2 mt-9 flex flex-wrap gap-3">
                {user ? (
                  <Link href="/inicio" className="btn-primary">
                    Ir para o início <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <>
                    <Link href="/cadastro" className="btn-primary">
                      Fazer parte <ArrowRight className="size-4" />
                    </Link>
                    <Link href="/login" className="btn-secondary">
                      Já tenho uma conta
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="border-t border-line bg-brand px-5 py-12 text-white lg:border-l lg:border-t-0 lg:px-12 lg:py-20">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-white/65">
                O que você encontra aqui
              </p>
              <div className="mt-8 divide-y divide-white/15">
                {areas.map(({ icon: Icon, title, text }) => (
                  <div className="flex gap-4 py-5 first:pt-0" key={title}>
                    <Icon className="mt-0.5 size-5 shrink-0" />
                    <div>
                      <h2 className="font-bold">{title}</h2>
                      <p className="mt-1 text-sm leading-6 text-white/70">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="border-t border-line bg-paper">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-[.8fr_1.2fr] md:items-start">
            <div>
              <p className="eyebrow">Formação profissional</p>
              <h2 className="section-title mt-3">Cursos participantes</h2>
              <p className="mt-3 max-w-md leading-7 text-muted">
                Um espaço comum para diferentes trajetórias de formação técnica.
              </p>
            </div>
            <ul className="grid grid-cols-1 border-t border-line sm:grid-cols-2">
              {courses.map((course) => (
                <li className="border-b border-line py-4 font-semibold sm:odd:pr-6 sm:even:pl-6" key={course}>
                  {course}
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="bg-brand text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2">
            <div>
              <ShieldCheck className="size-8" />
              <h2 className="mt-5 font-display text-4xl font-bold">
                Inclusão que funciona na prática.
              </h2>
              <p className="mt-4 max-w-lg text-white/75">
                Alto contraste, ajuste de fonte e redução de movimento tornam a
                experiência mais confortável para diferentes necessidades.
              </p>
            </div>
            <div>
              <HeartHandshake className="size-8" />
              <h2 className="mt-5 font-display text-4xl font-bold">
                Pedir ajuda é um ato de cuidado.
              </h2>
              <p className="mt-4 max-w-lg text-white/75">
                O canal privado orienta, gera protocolo e preserva as
                informações sensíveis fora de espaços públicos.
              </p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter authenticated={Boolean(user)} />
    </>
  );
}
