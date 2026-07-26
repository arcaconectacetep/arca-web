import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { IllustrativeCaption } from "@/components/ui/illustrative-caption";

export const metadata: Metadata = {
  title: "Proposta do ConectaCETEP",
  description: "Objetivos, metodologia e impacto esperado da tecnologia social ConectaCETEP baseada no método ARCA.",
  alternates: { canonical: "/proposta" },
};

const objectives = ["Centralizar a comunicação técnica e institucional da unidade escolar.", "Integrar aprendizagem, projetos, cultura e oportunidades do território.", "Aplicar acessibilidade digital para estudantes PcD e diferentes necessidades de uso.", "Oferecer um canal privado, rastreável e responsável contra bullying e discriminação."];
const phases = [["01", "Escuta e requisitos", "Mapeamento das necessidades dos cursos e da comunidade escolar."], ["02", "Arquitetura", "Organização segura de dados, papéis, fluxos e cinco áreas de informação."], ["03", "Inclusão", "Temas, contraste, fontes, movimento reduzido e testes de acessibilidade."], ["04", "Homologação", "Validação técnica, privacidade, responsividade e demonstração do protótipo."]];

export default async function Page() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  return <>
    <PublicHeader authenticated={Boolean(user)} />
    <main id="conteudo">
      <header className="border-b border-line bg-paper"><div className="mx-auto max-w-5xl px-5 py-16 sm:py-24"><p className="eyebrow">Proposta de inovação tecnológica</p><h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">Formação técnica aplicada a um problema real da comunidade.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-muted">A proposta transforma o cotidiano escolar em campo de pesquisa-ação: estudantes identificam necessidades, projetam uma solução de baixo custo e testam um produto digital voltado ao interesse público.</p></div></header>
      <figure className="mx-auto max-w-5xl px-5 pt-12">
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-brand-soft sm:aspect-[16/7]">
          <Image src="/images/institutional/arca-processo.webp" fill priority sizes="(max-width: 1024px) 100vw, 984px" alt="Mesa de trabalho com computador, equipamento de rede, cabos e planejamento de um protótipo técnico" className="object-cover" />
        </div>
        <IllustrativeCaption description="Cena representativa do processo de arquitetura, redes e prototipagem." />
      </figure>
      <section className="mx-auto grid max-w-5xl gap-12 px-5 py-16 lg:grid-cols-2"><div><p className="eyebrow">Objetivo geral</p><h2 className="section-title mt-3">Consolidar uma rede social acadêmica para integração e cuidado.</h2><p className="mt-4 leading-7 text-muted">O protótipo reúne disseminação cultural, comunicação pedagógica, participação estudantil, proteção socioemocional e combate sistemático ao bullying e aos preconceitos.</p></div><ul className="space-y-3">{objectives.map((item) => <li className="flex gap-3 rounded-xl bg-paper p-4 shadow-quiet" key={item}><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" /><span className="text-sm leading-6">{item}</span></li>)}</ul></section>
      <section className="border-y border-line bg-paper"><div className="mx-auto max-w-5xl px-5 py-16"><p className="eyebrow">Pesquisa-ação e desenvolvimento ágil</p><h2 className="section-title mt-3">Quatro fases, uma entrega funcional.</h2><div className="mt-8 border-t border-line">{phases.map(([number, title, text]) => <article className="grid gap-2 border-b border-line py-5 sm:grid-cols-[52px_200px_1fr] sm:gap-5" key={number}><span className="font-bold tabular-nums text-brand">{number}</span><h3 className="font-bold">{title}</h3><p className="text-sm leading-6 text-muted">{text}</p></article>)}</div></div></section>
      <section className="mx-auto max-w-5xl px-5 py-16"><div className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><p className="eyebrow">Protótipo acadêmico funcional</p><h2 className="section-title mt-2">Conheça a plataforma em funcionamento.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted">O MVP web preserva o propósito do ARCA com autenticação, perfis, publicações, acessibilidade, moderação e suporte privado por protocolo.</p></div><Link className="btn-primary shrink-0" href={user ? "/inicio" : "/cadastro"}>{user ? "Acessar plataforma" : "Criar uma conta"}<ArrowRight className="size-4" /></Link></div></section>
    </main>
    <PublicFooter authenticated={Boolean(user)} />
  </>;
}
