"use client";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { profileSchema } from "@/lib/validations";
import { updateProfile } from "@/app/actions";
import { z } from "zod";
import { SelectField } from "@/components/ui/select-field";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { colorModeOptions, fontFamilyOptions, fontScaleOptions, shiftOptions, themeOptions } from "@/lib/appearance-options";
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: name,
      theme: "DEFAULT",
      colorMode: "SYSTEM",
      fontFamily: "INTER",
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
        <Controller control={control} name="courseId" render={({ field }) => <SelectField value={field.value ?? ""} onValueChange={field.onChange} options={[{ value: "", label: "Selecione" }, ...courses.map((course) => ({ value: course.id, label: course.name }))]} />} />
        <small className="text-danger">{errors.courseId?.message}</small>
      </label>
      <label>
        <span className="label">Turma (opcional)</span>
        <input className="field" {...register("className")} />
      </label>
      <label>
        <span className="label">Turno (opcional)</span>
        <Controller control={control} name="shift" render={({ field }) => <SelectField value={field.value ?? ""} onValueChange={field.onChange} options={shiftOptions.map((option) => ({ ...option, label: option.value ? option.label : "Selecione" }))} />} />
      </label>
      <label className="md:col-span-2">
        <span className="label">Biografia (opcional)</span>
        <textarea className="field min-h-24 resize-y" {...register("bio")} />
      </label>
      <fieldset className="rounded-xl bg-canvas p-4 md:col-span-2">
        <legend className="label px-1">Aparência</legend>
        <p className="mb-4 text-sm text-muted">Você poderá alterar estas escolhas depois nas configurações.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label><span className="label">Tema visual</span><Controller control={control} name="theme" render={({ field }) => <SelectField value={field.value} onValueChange={field.onChange} options={[...themeOptions]} />} /></label>
          <label><span className="label">Modo de cor</span><Controller control={control} name="colorMode" render={({ field }) => <SelectField value={field.value} onValueChange={field.onChange} options={[...colorModeOptions]} />} /></label>
          <label><span className="label">Fonte</span><Controller control={control} name="fontFamily" render={({ field }) => <SelectField value={field.value} onValueChange={field.onChange} options={[...fontFamilyOptions]} />} /></label>
        </div>
      </fieldset>
      <fieldset className="md:col-span-2">
        <legend className="label">Acessibilidade</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex min-h-11 items-center gap-2">
            <Controller control={control} name="highContrast" render={({ field }) => <CheckboxField checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />} /> Alto
            contraste
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <Controller control={control} name="reducedMotion" render={({ field }) => <CheckboxField checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />} /> Reduzir
            movimento
          </label>
          <label>
            <span className="sr-only">Tamanho da fonte</span>
            <Controller control={control} name="fontScale" render={({ field }) => <SelectField value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))} options={[...fontScaleOptions]} />} />
          </label>
        </div>
      </fieldset>
      <label className="flex gap-3 md:col-span-2">
        <Controller control={control} name="termsAccepted" render={({ field }) => <CheckboxField checked={field.value === true} onCheckedChange={(checked) => field.onChange(checked === true)} />} />
        <span className="text-sm">
          Li e aceito os termos de uso e a política de privacidade.
        </span>
        <small className="text-danger">{errors.termsAccepted?.message}</small>
      </label>
      <button disabled={pending} className="btn-primary md:col-span-2">
        {pending ? "Salvando…" : "Concluir e entrar"}
      </button>
    </form>
  );
}
