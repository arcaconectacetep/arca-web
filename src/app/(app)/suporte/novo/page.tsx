import { SupportForm } from "@/components/support/support-form";
import { PageBack } from "@/components/ui/page-back";
export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageBack fallback="/suporte" label="Voltar ao suporte" />
      <p className="eyebrow">Nova solicitação</p>
      <h1 className="page-title mt-2">Conte o que aconteceu.</h1>
      <p className="mb-7 mt-3 text-muted">
        Use palavras simples e compartilhe apenas o necessário.
      </p>
      <SupportForm />
    </div>
  );
}
