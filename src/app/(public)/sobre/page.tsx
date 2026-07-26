import type { Metadata } from "next";
import Image from "next/image";
import { BookOpen, MapPin, Network, School, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { IllustrativeCaption } from "@/components/ui/illustrative-caption";

export const metadata: Metadata = {
  title: "Sobre o projeto ARCA",
  description: "Origem, território e propósito do ConectaCETEP, tecnologia social desenvolvida pelo curso técnico em Informática de Itaberaba.",
  alternates: { canonical: "/sobre" },
};

export default async function Page() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  return <>
    <PublicHeader authenticated={Boolean(user)} />
    <main id="conteudo">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <p className="eyebrow">Sobre o projeto</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">Uma rede criada na escola para fortalecer a própria escola.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">O ConectaCETEP é uma tecnologia social digital desenvolvida pelo curso técnico em Informática, em Itaberaba, para integrar comunicação, aprendizagem, cultura e proteção socioemocional na Educação Profissional e Tecnológica.</p>
        </div>
      </header>
      <figure className="mx-auto max-w-5xl px-5 pt-12">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-brand-soft">
          <Image src="/images/institutional/arca-comunidade.webp" fill priority sizes="(max-width: 1024px) 100vw, 984px" alt="Estudantes em ambiente escolar analisam juntos um projeto, com participação de um estudante cadeirante" className="object-cover" />
        </div>
        <IllustrativeCaption description="Cena representativa de inclusão e participação estudantil." />
      </figure>
      <section className="mx-auto grid max-w-5xl gap-12 px-5 py-16 lg:grid-cols-[.7fr_1.3fr]">
        <div><MapPin className="size-7 text-brand" /><h2 className="section-title mt-4">De onde partimos</h2></div>
        <div className="space-y-5 leading-8 text-muted"><p>No Território de Identidade do Piemonte do Paraguaçu, diferentes cursos e perfis estudantis convivem com desafios comuns: informação fragmentada, isolamento digital, barreiras de acessibilidade, cyberbullying e preconceito.</p><p>O projeto nasce da ideia de que a formação técnica pode responder a essas questões com recursos da própria unidade escolar. Laboratórios, conhecimento de redes e engenharia de software tornam-se instrumentos de participação e direitos humanos.</p></div>
      </section>
      <section className="bg-brand text-white"><div className="mx-auto max-w-5xl px-5 py-16"><p className="text-xs font-bold uppercase tracking-[.16em] text-white/65">Método ARCA</p><h2 className="mt-3 text-3xl font-bold">Arquitetura de Redes para Conectividade e Aparato Socioemocional no Paraguaçu.</h2><div className="mt-10 grid gap-8 sm:grid-cols-2"><div><Network className="size-6" /><h3 className="mt-3 font-bold">Conectividade com propósito</h3><p className="mt-2 text-sm leading-6 text-white/75">Uma arquitetura de informação que reúne cursos, pessoas e serviços sem apagar suas particularidades.</p></div><div><ShieldCheck className="size-6" /><h3 className="mt-3 font-bold">Proteção como estrutura</h3><p className="mt-2 text-sm leading-6 text-white/75">O acolhimento não é um recurso isolado: é uma das cinco áreas permanentes da experiência.</p></div></div></div></section>
      <section className="mx-auto max-w-5xl px-5 py-16"><div className="grid gap-8 sm:grid-cols-3"><article><School className="size-6 text-brand" /><h2 className="mt-4 font-bold">Autoria estudantil</h2><p className="mt-2 text-sm leading-6 text-muted">Uma iniciativa assinada pelo curso técnico em Informática e construída no contexto da escola pública.</p></article><article><BookOpen className="size-6 text-brand" /><h2 className="mt-4 font-bold">Integração pedagógica</h2><p className="mt-2 text-sm leading-6 text-muted">Saberes técnicos circulam entre Informática, Redes, Administração, Logística, Segurança do Trabalho, Secretariado e Enfermagem.</p></article><article><ShieldCheck className="size-6 text-brand" /><h2 className="mt-4 font-bold">Inclusão verificável</h2><p className="mt-2 text-sm leading-6 text-muted">Contraste, escala de fonte, redução de movimento, navegação sem mouse e privacidade aplicada desde a arquitetura.</p></article></div></section>
    </main>
    <PublicFooter authenticated={Boolean(user)} />
  </>;
}
