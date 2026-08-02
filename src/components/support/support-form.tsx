"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { createSupportAlert } from "@/app/actions";
import { alertUrgencyLabels, labelFor } from "@/lib/labels";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { RadioGroupField } from "@/components/ui/radio-group-field";
const categories = [
  { value: "BULLYING", label: "Bullying" },
  { value: "CYBERBULLYING", label: "Cyberbullying" },
  { value: "PREJUDICE", label: "Preconceito" },
  { value: "DISCRIMINATION", label: "Discriminação" },
  { value: "HARASSMENT", label: "Assédio" },
  { value: "THREAT", label: "Ameaça" },
  { value: "ACCESSIBILITY", label: "Acessibilidade" },
  { value: "EMOTIONAL_SUPPORT", label: "Sofrimento emocional" },
  { value: "OTHER", label: "Outro problema escolar" },
];
const urgencyOptions = [
  {
    value: "GUIDANCE",
    label: "Orientação",
    description: "Preciso conversar e entender os próximos passos.",
  },
  {
    value: "ATTENTION",
    label: "Atenção",
    description: "A situação precisa de acompanhamento em breve.",
  },
  {
    value: "URGENT",
    label: "Urgente",
    description: "Há risco imediato ou a situação está acontecendo agora.",
  },
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
          <motion.span
            key={n}
            className={`h-2 flex-1 rounded-full ${n <= step ? "bg-brand" : "bg-line"}`}
            animate={{ opacity: n <= step ? 1 : 0.55 }}
          />
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
      {step === 1 && (
        <motion.fieldset
          key="category"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
        >
          <legend className="section-title">
            Que tipo de situação deseja relatar?
          </legend>
          <p className="mt-2 text-muted">
            Escolha a opção que mais se aproxima. A equipe fará o acolhimento
            adequado.
          </p>
          <div className="mt-6">
            <RadioGroupField
              name="category"
              options={categories}
              value={data.category}
              onValueChange={(category) => setData({ ...data, category })}
            />
          </div>
        </motion.fieldset>
      )}
      {step === 2 && (
        <motion.div
          key="details"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          className="space-y-5"
        >
          <fieldset>
            <legend className="label">Qual o nível de urgência?</legend>
            <div className="mt-2">
              <RadioGroupField
                name="urgency"
                options={urgencyOptions}
                value={data.urgency}
                onValueChange={(urgency) => setData({ ...data, urgency })}
                columns={3}
              />
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
            <div>
              <span className="label">Quando ocorreu (opcional)</span>
              <DateTimePicker
                value={data.happenedAt}
                onChange={(happenedAt) => setData({ ...data, happenedAt })}
              />
            </div>
          </div>
          <label className="flex gap-3">
            <CheckboxField checked={data.allowContact} onCheckedChange={(checked) => setData({ ...data, allowContact: checked === true })} />
            <span>Aceito que a gestão entre em contato comigo.</span>
          </label>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div
          key="review"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
        >
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
                {categories.find((x) => x.value === data.category)?.label}
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
        </motion.div>
      )}
      </AnimatePresence>
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
