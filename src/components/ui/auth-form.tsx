"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { login, recoverPassword, signUp, updatePassword } from "@/app/actions";
import { Turnstile } from "@/components/security/turnstile";
import {
  loginSchema,
  recoverPasswordSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations";

type Mode = "login" | "signup" | "recover" | "reset";
type AuthFields = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
};

const schemas: Record<Mode, z.ZodTypeAny> = {
  login: loginSchema,
  signup: signupSchema,
  recover: recoverPasswordSchema,
  reset: resetPasswordSchema,
};

const buttonLabels: Record<Mode, string> = {
  login: "Entrar na plataforma",
  signup: "Criar minha conta",
  recover: "Enviar link de recuperação",
  reset: "Salvar nova senha",
};

function PasswordField({
  id,
  label,
  error,
  autoComplete,
  register,
}: {
  id: "password" | "confirmPassword";
  label: string;
  error?: string;
  autoComplete: "current-password" | "new-password";
  register: ReturnType<typeof useForm<AuthFields>>["register"];
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          {...register(id)}
          id={id}
          className="field pr-12"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button
          className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-[10px] text-muted transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-brand"
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={
            visible
              ? `Ocultar ${label.toLowerCase()}`
              : `Mostrar ${label.toLowerCase()}`
          }
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm font-medium text-danger"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: "8 caracteres", met: password.length >= 8 },
    { label: "uma letra", met: /[A-Za-zÀ-ÿ]/.test(password) },
    { label: "um número", met: /[0-9]/.test(password) },
  ];
  const progress = requirements.filter(({ met }) => met).length;

  return (
    <div className="rounded-xl bg-canvas p-3" aria-live="polite">
      <div className="mb-2 flex gap-1" aria-hidden>
        {requirements.map((item) => (
          <span
            key={item.label}
            className={`h-1 flex-1 rounded-full transition-colors ${item.met ? "bg-success" : "bg-line"}`}
          />
        ))}
      </div>
      <p className="sr-only">{progress} de 3 requisitos atendidos.</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {requirements.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span
              className={`grid size-4 place-items-center rounded-full ${item.met ? "bg-success text-white" : "border border-line"}`}
              aria-hidden
            >
              {item.met && <Check className="size-3" strokeWidth={3} />}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AuthFields>({
    resolver: zodResolver(schemas[mode]) as Resolver<AuthFields>,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { acceptTerms: false },
  });
  const password = watch("password") ?? "";

  function submit(values: AuthFields) {
    setServerError("");
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === "boolean") {
        if (value) form.set(key, "on");
      } else if (value !== undefined) form.set(key, value);
    });
    if (mode !== "reset") form.set("captchaToken", captchaToken);

    startTransition(async () => {
      const action =
        mode === "login"
          ? login
          : mode === "signup"
            ? signUp
            : mode === "recover"
              ? recoverPassword
              : updatePassword;
      const result = await action(form);
      if (result && !result.ok) {
        setServerError(result.error);
        setCaptchaToken("");
        setCaptchaNonce((value) => value + 1);
      } else if (mode !== "login") setSuccess(true);
    });
  }

  if (success) {
    const isRecovery = mode === "recover" || mode === "signup";
    return (
      <div
        className="reveal rounded-2xl border border-line bg-paper p-6 text-center shadow-lift"
        role="status"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-success/10 text-success">
          <MailCheck className="size-6" />
        </span>
        <h2 className="mt-4 text-xl font-bold">
          {isRecovery ? "Confira seu e-mail" : "Senha atualizada"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {mode === "signup"
            ? "Enviamos uma confirmação para o endereço informado. Abra o link para continuar seu cadastro."
            : mode === "recover"
              ? "Se existir uma conta com esse endereço, você receberá um link seguro para criar uma nova senha."
              : "Sua nova senha já está ativa. Você pode entrar novamente com segurança."}
        </p>
        <Link className="btn-primary mt-6 w-full" href="/login">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      {mode === "signup" && (
        <div>
          <label className="label" htmlFor="fullName">
            Nome completo
          </label>
          <input
            {...register("fullName")}
            id="fullName"
            className="field"
            autoComplete="name"
            autoFocus
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          {errors.fullName && (
            <p
              id="fullName-error"
              className="mt-1.5 text-sm font-medium text-danger"
              role="alert"
            >
              {errors.fullName.message}
            </p>
          )}
        </div>
      )}

      {mode !== "reset" && (
        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input
            {...register("email")}
            id="email"
            className="field"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus={mode !== "signup"}
            placeholder="voce@exemplo.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-1.5 text-sm font-medium text-danger"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>
      )}

      {mode !== "recover" && (
        <>
          <PasswordField
            id="password"
            label={mode === "reset" ? "Nova senha" : "Senha"}
            error={errors.password?.message}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            register={register}
          />
          {(mode === "signup" || mode === "reset") && (
            <>
              <PasswordRequirements password={password} />
              <PasswordField
                id="confirmPassword"
                label="Confirmar senha"
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
                register={register}
              />
            </>
          )}
        </>
      )}

      {mode === "signup" && (
        <div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3.5 text-sm leading-6 text-muted transition-colors hover:bg-canvas">
            <input
              {...register("acceptTerms")}
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-brand"
              aria-invalid={Boolean(errors.acceptTerms)}
              aria-describedby={
                errors.acceptTerms ? "acceptTerms-error" : undefined
              }
            />
            <span>
              Li e aceito os{" "}
              <Link
                className="font-semibold text-brand underline-offset-4 hover:underline"
                href="/termos"
                target="_blank"
              >
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link
                className="font-semibold text-brand underline-offset-4 hover:underline"
                href="/privacidade"
                target="_blank"
              >
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p
              id="acceptTerms-error"
              className="mt-1.5 text-sm font-medium text-danger"
              role="alert"
            >
              {errors.acceptTerms.message}
            </p>
          )}
        </div>
      )}

      {serverError && (
        <div
          className="rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
          role="alert"
        >
          {serverError}
        </div>
      )}

      {mode !== "reset" && (
        <Turnstile key={captchaNonce} onToken={setCaptchaToken} />
      )}

      <button
        disabled={pending || (mode !== "reset" && !captchaToken)}
        className="btn-primary w-full"
        type="submit"
      >
        {pending && (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        )}
        {pending ? "Processando…" : buttonLabels[mode]}
      </button>
    </form>
  );
}
