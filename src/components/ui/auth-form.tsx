"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { login, recoverPassword, signUp, updatePassword } from "@/app/actions";
type Mode = "login" | "signup" | "recover" | "reset";
export function AuthForm({ mode }: { mode: Mode }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  async function submit(form: FormData) {
    setError("");
    start(async () => {
      const action =
        mode === "login"
          ? login
          : mode === "signup"
            ? signUp
            : mode === "recover"
              ? recoverPassword
              : updatePassword;
      const result = await action(form);
      if (result && !result.ok) setError(result.error);
      else if (mode !== "login")
        toast.success(
          mode === "signup"
            ? "Conta criada. Confira seu e-mail para confirmar."
            : mode === "recover"
              ? "Enviamos as instruções, caso o e-mail esteja cadastrado."
              : "Senha atualizada.",
        );
    });
  }
  return (
    <form action={submit} className="space-y-4">
      {mode === "signup" && (
        <label className="block">
          <span className="label">Nome completo</span>
          <input
            className="field"
            name="fullName"
            required
            autoComplete="name"
          />
        </label>
      )}{" "}
      {mode !== "reset" && (
        <label className="block">
          <span className="label">E-mail</span>
          <input
            className="field"
            type="email"
            name="email"
            required
            autoComplete="email"
          />
        </label>
      )}
      {!["recover"].includes(mode) && (
        <label className="block">
          <span className="label">Senha</span>
          <input
            className="field"
            type="password"
            minLength={8}
            name="password"
            required
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
          <small className="mt-1 block text-muted">
            Mínimo de 8 caracteres.
          </small>
        </label>
      )}
      <p aria-live="polite" className="text-sm font-semibold text-danger">
        {error}
      </p>
      <button disabled={pending} className="btn-primary w-full">
        {pending
          ? "Aguarde…"
          : mode === "login"
            ? "Entrar"
            : mode === "signup"
              ? "Criar minha conta"
              : mode === "recover"
                ? "Enviar instruções"
                : "Salvar nova senha"}
      </button>
    </form>
  );
}
