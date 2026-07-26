"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createSupportAlert } from "@/app/actions";
import { alertUrgencyLabels, labelFor } from "@/lib/labels";
import { CheckboxField } from "@/components/ui/checkbox-field";
const categories = [
  ["BULLYING", "Bullying"],
  ["CYBERBULLYING", "Cyberbullying"],
  ["PREJUDICE", "Preconceito"],
  ["DISCRIMINATION", "Discriminação"],
  ["HARASSMENT", "Assédio"],
  ["THREAT", "Ameaça"],
  ["ACCESSIBILITY", "Acessibilidade"],
  ["EMOTIONAL_SUPPORT", "Sofrimento emocional"],
  ["OTHER", "Outro problema escolar"],
];
export function SupportForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, start] = useTransition();
  const [data, setData] = useState({
    category: "",
    urgency: "GUIDANCE",
    description: "",
    location: "",
    happenedAt: "",
    allowContact: true,
  });
  function next() {
    if (step === 1 && !data.category)
      return toast.error("Selecione o tipo da situação.");
    if (step === 2 && data.description.trim().length < 20)
      return toast.error("Descreva o ocorrido com pelo menos 20 caracteres.");
    setStep((s) => Math.min(3, s + 1));
  }
  function send() {
    start(async () => {
      const r = await createSupportAlert(data);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(`Solicitação enviada. Protocolo ${r.data?.protocol}`);
      router.push(`/suporte/${r.data?.id}`);
    });
  }
  return (
    <div className="card p-5 md:p-8">
      <div
        className="mb-8 flex items-center gap-2"
        aria-label={`Etapa ${step} de 3`}
      >
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-2 flex-1 rounded-full ${n <= step ? "bg-brand" : "bg-line"}`}
          />
        ))}
      </div>
      {step === 1 && (
        <fieldset>
          <legend className="section-title">
            Que tipo de situação deseja relatar?
          </legend>
          <p className="mt-2 text-muted">
            Escolha a opção que mais se aproxima. A equipe fará o acolhimento
            adequado.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {categories.map(([value, label]) => (
              <label
                key={value}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 ${data.category === value ? "border-brand bg-brand-soft" : "border-line"}`}
              >
                <input
                  type="radio"
                  name="category"
                  value={value}
                  checked={data.category === value}
                  onChange={(e) =>
                    setData({ ...data, category: e.target.value })
                  }
                />
                <span className="font-semibold">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {step === 2 && (
        <div className="space-y-5">
          <fieldset>
            <legend className="label">Qual o nível de urgência?</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                ["GUIDANCE", "Orientação"],
                ["ATTENTION", "Atenção"],
                ["URGENT", "Urgente"],
              ].map(([v, l]) => (
                <label
                  key={v}
                  className="flex min-h-12 items-center gap-2 rounded-xl border border-line p-3"
                >
                  <input
                    type="radio"
                    checked={data.urgency === v}
                    onChange={() => setData({ ...data, urgency: v })}
                  />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            <span className="label">Descreva o ocorrido</span>
            <textarea
              className="field min-h-40"
              maxLength={5000}
              value={data.description}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
              placeholder="Conte apenas o necessário para que a equipe compreenda e possa ajudar."
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Local (opcional)</span>
              <input
                className="field"
                value={data.location}
                onChange={(e) => setData({ ...data, location: e.target.value })}
              />
            </label>
            <label>
              <span className="label">Quando ocorreu (opcional)</span>
              <input
                type="datetime-local"
                className="field"
                value={data.happenedAt}
                onChange={(e) =>
                  setData({ ...data, happenedAt: e.target.value })
                }
              />
            </label>
          </div>
          <label className="flex gap-3">
            <CheckboxField checked={data.allowContact} onCheckedChange={(checked) => setData({ ...data, allowContact: checked === true })} />
            <span>Aceito que a gestão entre em contato comigo.</span>
          </label>
        </div>
      )}
      {step === 3 && (
        <div>
          <CheckCircle2 className="size-9 text-brand" />
          <h2 className="section-title mt-4">Revise antes de confirmar</h2>
          <p className="mt-2 text-muted">
            O envio só ocorrerá após sua confirmação. Não é possível anexar
            imagens.
          </p>
          <dl className="mt-6 divide-y divide-line rounded-xl bg-canvas p-5 text-sm">
            <div className="py-3">
              <dt className="font-bold">Tipo</dt>
              <dd className="mt-1 text-muted">
                {categories.find((x) => x[0] === data.category)?.[1]}
              </dd>
            </div>
            <div className="py-3">
              <dt className="font-bold">Urgência</dt>
              <dd className="mt-1 text-muted">
                {labelFor(alertUrgencyLabels, data.urgency)}
              </dd>
            </div>
            <div className="py-3">
              <dt className="font-bold">Descrição</dt>
              <dd className="mt-1 whitespace-pre-wrap text-muted">
                {data.description}
              </dd>
            </div>
            <div className="py-3">
              <dt className="font-bold">Contato</dt>
              <dd className="mt-1 text-muted">
                {data.allowContact ? "Autorizado" : "Não autorizado"}
              </dd>
            </div>
          </dl>
        </div>
      )}
      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <button
            className="btn-secondary"
            onClick={() => setStep((s) => s - 1)}
          >
            <ArrowLeft className="size-4" />
            Voltar
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button className="btn-primary" onClick={next}>
            Continuar
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button disabled={pending} className="btn-primary" onClick={send}>
            {pending ? "Enviando…" : "Confirmar envio"}
          </button>
        )}
      </div>
    </div>
  );
}
