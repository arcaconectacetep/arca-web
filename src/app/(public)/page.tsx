import Link from "next/link";
import Image from "next/image";
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
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { createClient } from "@/lib/supabase/server";
import { IllustrativeCaption } from "@/components/ui/illustrative-caption";

export const metadata: Metadata = {
  title: "ARCA — Rede acadêmica e tecnologia social",
  description: "Conheça o ConectaCETEP, tecnologia social criada pelo curso técnico em Informática para conectar aprendizagem, comunicação e acolhimento no Piemonte do Paraguaçu.",
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
      <PublicHeader authenticated={Boolean(user)} />
      <main id="conteudo">
        <section className="border-y border-line bg-paper">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.15fr_.85fr]">
            <div className="px-5 py-20 sm:py-28 lg:py-32 lg:pr-16">
              <p className="eyebrow mb-5">Método ARCA · Itaberaba, Bahia</p>
              <h1 className="reveal max-w-3xl font-display text-5xl font-bold leading-[.98] md:text-7xl">
                Informação, aprendizado e acolhimento em um só espaço.
              </h1>
              <p className="reveal reveal-delay-1 mt-7 max-w-2xl text-lg leading-8 text-muted">
                O ConectaCETEP conecta estudantes, professores e projetos,
                fortalecendo a comunicação, a inclusão e o cuidado dentro da
                comunidade escolar.
              </p>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-ink/75">
                Uma tecnologia social desenvolvida a partir do curso técnico em Informática para a Educação Profissional e Tecnológica.
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
        <figure className="mx-auto max-w-7xl px-5 pt-16">
          <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-brand-soft sm:aspect-[16/7]">
            <Image
              src="/images/institutional/arca-laboratorio.webp"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1240px"
              alt="Estudantes de cursos técnicos colaboram em um projeto de redes no laboratório de informática"
              className="object-cover"
            />
          </div>
          <IllustrativeCaption description="Cena representativa de colaboração técnica em ambiente escolar." />
        </figure>
        <section className="mx-auto max-w-7xl px-5 py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="eyebrow">A estrutura do projeto</p>
              <h2 className="page-title mt-3">ARCA é método, território e proteção.</h2>
              <p className="mt-5 leading-7 text-muted">
                O nome organiza a proposta que sustenta o ConectaCETEP: usar conhecimento técnico para aproximar pessoas, circular saberes e fortalecer uma rede de cuidado no Piemonte do Paraguaçu.
              </p>
              <Link className="btn-secondary mt-6" href="/sobre">Conhecer a história <ArrowRight className="size-4" /></Link>
            </div>
            <dl className="border-t border-line">
              {[
                ["A", "Arquitetura", "Organiza informação, serviços e responsabilidades em uma plataforma comum."],
                ["R", "Redes", "Conecta cursos, estudantes, professores, gestão e projetos da escola."],
                ["C", "Conectividade", "Reduz a fragmentação da comunicação e aproxima o cotidiano juvenil da aprendizagem."],
                ["A", "Aparato socioemocional", "Oferece acolhimento privado, protocolo e encaminhamento responsável."],
              ].map(([letter, title, text]) => (
                <div className="grid grid-cols-[44px_1fr] gap-4 border-b border-line py-5" key={title}>
                  <dt className="text-2xl font-black text-brand">{letter}</dt>
                  <dd><strong className="block">{title}</strong><p className="mt-1 text-sm leading-6 text-muted">{text}</p></dd>
                </div>
              ))}
            </dl>
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
        <section className="border-b border-line bg-paper">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="eyebrow">Pesquisa e inovação pública</p><h2 className="section-title mt-2">Da sala de aula para o território.</h2><p className="mt-2 max-w-2xl text-muted">Pesquisa-ação, desenvolvimento ágil e recursos da própria escola transformados em um protótipo funcional de baixo custo.</p></div>
            <Link className="btn-primary shrink-0" href="/proposta">Ver a proposta <ArrowRight className="size-4" /></Link>
          </div>
        </section>
      </main>
      <PublicFooter authenticated={Boolean(user)} />
    </>
  );
}
