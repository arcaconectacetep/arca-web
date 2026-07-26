import type { Metadata } from "next";
import { Scale } from "lucide-react";
import { LegalPage, type LegalSection } from "@/components/ui/legal-page";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Regras para participação responsável na comunidade ConectaARCA.",
  alternates: { canonical: "/termos" },
};

const sections: LegalSection[] = [
  {
    id: "finalidade",
    title: "Finalidade da plataforma",
    content: (
      <p>
        O ConectaARCA é um protótipo acadêmico voltado à comunicação,
        aprendizagem e convivência da comunidade escolar. A plataforma
        não substitui canais oficiais da instituição ou serviços de emergência.
      </p>
    ),
  },
  {
    id: "conta",
    title: "Sua conta",
    content: (
      <p>
        Use informações verdadeiras, mantenha sua senha protegida e não
        compartilhe o acesso. Cada pessoa é responsável pelas atividades
        realizadas em sua conta. Contas suspensas não podem publicar ou
        interagir até a revisão da equipe autorizada.
      </p>
    ),
  },
  {
    id: "convivencia",
    title: "Convivência e publicações",
    content: (
      <>
        <p>
          Participe com respeito. Não publique conteúdo ofensivo,
          discriminatório, ilegal, enganoso ou que exponha dados pessoais de
          terceiros sem autorização.
        </p>
        <p>
          Publicações e comentários podem ser moderados quando violarem estas
          regras ou colocarem alguém em risco. Denúncias devem ser feitas de
          boa-fé.
        </p>
      </>
    ),
  },
  {
    id: "suporte",
    title: "Canal de suporte",
    content: (
      <p>
        O canal de suporte é destinado ao acolhimento e encaminhamento de
        situações escolares. Relatos devem conter apenas as informações
        necessárias. Em risco imediato, procure um adulto responsável ou o
        serviço de emergência adequado.
      </p>
    ),
  },
  {
    id: "moderacao",
    title: "Moderação e suspensão",
    content: (
      <p>
        STAFF e ADMIN podem ocultar conteúdo, analisar denúncias e suspender
        contas quando necessário para proteger a comunidade. Ações
        administrativas relevantes são registradas para auditoria.
      </p>
    ),
  },
  {
    id: "alteracoes",
    title: "Alterações destes termos",
    content: (
      <p>
        Como este é um protótipo em evolução, estes termos podem ser
        atualizados. A versão e a data mais recentes estarão sempre disponíveis
        nesta página.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      eyebrow="Regras da comunidade"
      title="Termos de Uso"
      description="Um acordo simples para manter o ConectaARCA seguro, respeitoso e útil para toda a comunidade escolar."
      updatedAt="26 de julho de 2026"
      sections={sections}
      icon={Scale}
    />
  );
}
