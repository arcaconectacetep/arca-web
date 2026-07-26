"use client";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { profileSchema } from "@/lib/validations";
import { updateProfile } from "@/app/actions";
import { z } from "zod";
type Values = z.infer<typeof profileSchema>;
export function OnboardingForm({
  courses,
  name,
}: {
  courses: { id: string; name: string }[];
  name: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: name,
      theme: "DEFAULT",
      highContrast: false,
      reducedMotion: false,
      fontScale: 1,
      termsAccepted: undefined,
    },
  });
  const onSubmit = handleSubmit((data) =>
    start(async () => {
      const r = await updateProfile(data);
      if (!r.ok) toast.error(r.error);
      else {
        toast.success("Perfil preparado!");
        router.push("/inicio");
      }
    }),
  );
  return (
    <form
      onSubmit={onSubmit}
      className="card grid gap-5 p-5 md:grid-cols-2 md:p-8"
    >
      <label>
        <span className="label">Nome completo</span>
        <input className="field" {...register("fullName")} />
        <small className="text-danger">{errors.fullName?.message}</small>
      </label>
      <label>
        <span className="label">Username</span>
        <div className="flex items-center rounded-[10px] border border-line bg-canvas px-3 focus-within:border-brand">
          <span className="text-muted">@</span>
          <input
            className="min-h-11 w-full bg-transparent px-1 outline-none"
            placeholder="ana.silva"
            {...register("username")}
          />
        </div>
        <small className="text-danger">{errors.username?.message}</small>
      </label>
      <label>
        <span className="label">Curso</span>
        <select className="field" {...register("courseId")}>
          <option value="">Selecione</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="label">Turma (opcional)</span>
        <input className="field" {...register("className")} />
      </label>
      <label>
        <span className="label">Turno (opcional)</span>
        <select className="field" {...register("shift")}>
          <option value="">Selecione</option>
          <option>Matutino</option>
          <option>Vespertino</option>
          <option>Noturno</option>
          <option>Integral</option>
        </select>
      </label>
      <label>
        <span className="label">Tema visual</span>
        <select className="field" {...register("theme")}>
          <option value="DEFAULT">Azul</option>
          <option value="AURORA">Aurora</option>
          <option value="NEUTRAL">Neutro</option>
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="label">Biografia (opcional)</span>
        <textarea className="field min-h-24 resize-y" {...register("bio")} />
      </label>
      <fieldset className="md:col-span-2">
        <legend className="label">Acessibilidade</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" {...register("highContrast")} /> Alto
            contraste
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" {...register("reducedMotion")} /> Reduzir
            movimento
          </label>
          <label>
            <span className="sr-only">Tamanho da fonte</span>
            <select
              className="field"
              {...register("fontScale", { valueAsNumber: true })}
            >
              <option value="1">Fonte 100%</option>
              <option value="1.15">Fonte 115%</option>
              <option value="1.3">Fonte 130%</option>
            </select>
          </label>
        </div>
      </fieldset>
      <label className="flex gap-3 md:col-span-2">
        <input type="checkbox" {...register("termsAccepted")} />
        <span className="text-sm">
          Li e aceito os termos de uso e a política de privacidade.
        </span>
      </label>
      <button disabled={pending} className="btn-primary md:col-span-2">
        {pending ? "Salvando…" : "Concluir e entrar"}
      </button>
    </form>
  );
}
