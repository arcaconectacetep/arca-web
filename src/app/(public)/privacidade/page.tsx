import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { LegalPage, type LegalSection } from "@/components/ui/legal-page";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o ConectaCETEP utiliza e protege os dados da comunidade escolar.",
  alternates: { canonical: "/privacidade" },
};

const sections: LegalSection[] = [
  {
    id: "dados",
    title: "Dados que utilizamos",
    content: (
      <p>
        Coletamos dados necessários para criar sua conta e oferecer as funções
        do protótipo: nome, e-mail, username, curso, turma opcional,
        preferências de acessibilidade e o conteúdo que você decide publicar.
      </p>
    ),
  },
  {
    id: "uso",
    title: "Como os dados são usados",
    content: (
      <p>
        Esses dados permitem autenticar usuários, apresentar perfis, organizar
        publicações, enviar notificações internas, aplicar permissões e manter a
        segurança da plataforma. Não usamos seus dados para publicidade.
      </p>
    ),
  },
  {
    id: "alertas",
    title: "Privacidade dos alertas de suporte",
    content: (
      <>
        <p>
          Solicitações de suporte nunca aparecem no feed ou no perfil público.
          Apenas o autor e pessoas autorizadas com papel STAFF ou ADMIN podem
          acessar o relato.
        </p>
        <p>
          Notas internas ficam restritas à equipe autorizada. Notificações ao
          estudante não incluem detalhes sensíveis do ocorrido.
        </p>
      </>
    ),
  },
  {
    id: "imagens",
    title: "Imagens e serviços externos",
    content: (
      <p>
        Avatares e imagens de publicações são hospedados no ImgChest e apenas
        suas URLs ficam registradas no banco. O canal de suporte não aceita
        imagens ou anexos.
      </p>
    ),
  },
  {
    id: "seguranca",
    title: "Segurança e acesso",
    content: (
      <p>
        A autenticação e o banco de dados utilizam o Supabase. Políticas de
        acesso no banco restringem informações conforme o papel de cada usuário.
        Senhas não são armazenadas diretamente pelo ConectaCETEP.
      </p>
    ),
  },
  {
    id: "cuidados",
    title: "Cuidados ao publicar",
    content: (
      <p>
        Evite divulgar endereço, telefone, documentos, dados médicos ou
        informações pessoais de terceiros. Compartilhe em relatos de suporte
        somente o necessário para o acolhimento e encaminhamento da situação.
      </p>
    ),
  },
  {
    id: "prototipo",
    title: "Limitações do protótipo",
    content: (
      <p>
        O ConectaCETEP é um projeto acadêmico funcional e ainda não representa
        um serviço institucional definitivo. Dados de demonstração não devem
        conter informações pessoais reais ou sensíveis.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      eyebrow="Privacidade e cuidado"
      title="Política de Privacidade"
      description="Entenda quais informações são utilizadas, quem pode acessá-las e como protegemos especialmente os relatos de suporte."
      updatedAt="26 de julho de 2026"
      sections={sections}
      icon={ShieldCheck}
    />
  );
}
