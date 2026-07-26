import type { Metadata } from "next";
import { Database, Eye, FileClock, ShieldCheck, Users } from "lucide-react";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Governança e transparência",
  description: "Como o protótipo ConectaCETEP organiza acesso, moderação, privacidade e responsabilidade institucional.",
  alternates: { canonical: "/governanca" },
};

const principles = [
  { icon: Users, title: "Acesso por função", text: "Estudantes, docentes, equipe escolar e administração recebem apenas as permissões necessárias para sua atuação." },
  { icon: Eye, title: "Moderação rastreável", text: "Mudanças administrativas relevantes são registradas. Conteúdo ocultado pode ser revisado e restaurado por pessoas autorizadas." },
  { icon: ShieldCheck, title: "Acolhimento reservado", text: "Relatos de suporte não entram no feed. Somente o autor, STAFF e ADMIN acessam a solicitação; notas internas ficam restritas à equipe." },
  { icon: Database, title: "Dados mínimos", text: "O canal solicita somente informações úteis ao encaminhamento e não aceita anexos. Imagens públicas são hospedadas no ImgChest." },
];

export default async function GovernancePage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  return <>
    <PublicHeader authenticated={Boolean(user)} />
    <main id="conteudo">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <p className="eyebrow">Governança e transparência</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">Tecnologia pública exige responsabilidades claras.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">Esta página documenta as regras já aplicadas pelo protótipo e distingue o que ainda depende de decisão formal da instituição antes de uso em produção.</p>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-2">
          {principles.map(({ icon: Icon, title, text }) => <article className="card p-6" key={title}><Icon className="size-6 text-brand" /><h2 className="mt-4 text-lg font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{text}</p></article>)}
        </div>
      </section>
      <section className="border-y border-line bg-paper">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 lg:grid-cols-[.7fr_1.3fr]">
          <div><FileClock className="size-7 text-brand" /><h2 className="section-title mt-4">Retenção e ciclo de vida</h2></div>
          <div className="space-y-5 leading-7 text-muted"><p>Contas podem ser excluídas pelo próprio titular. A exclusão remove o perfil e os registros vinculados no banco, conforme as relações definidas no sistema. URLs de imagens já enviadas ao provedor externo podem exigir tratamento operacional separado.</p><p>Solicitações de suporte permanecem disponíveis para acompanhamento e encaminhamento. O protótipo ainda não executa descarte automático por prazo: antes de uma implantação institucional, a unidade deverá aprovar prazos de retenção, responsáveis pelo tratamento, canal de contato e procedimento de exportação ou eliminação.</p></div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <p className="eyebrow">Limite do protótipo</p>
        <h2 className="section-title mt-3">Não substitui os protocolos oficiais da escola.</h2>
        <p className="mt-4 max-w-3xl leading-7 text-muted">O ConectaCETEP apoia comunicação e encaminhamento. Situações de risco imediato devem ser comunicadas a um adulto responsável ou ao serviço de emergência adequado. A gestão da unidade escolar deve definir formalmente encarregado, equipe de atendimento, prazos e fluxo de escalonamento antes do uso com dados reais.</p>
      </section>
    </main>
    <PublicFooter authenticated={Boolean(user)} />
  </>;
}
