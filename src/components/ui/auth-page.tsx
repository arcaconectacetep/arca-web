import { CheckCircle2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { AuthForm } from "./auth-form";
import { BrandLogo } from "./brand-logo";
export function AuthPage({
  mode,
  title,
  text,
}: {
  mode: "login" | "signup" | "recover" | "reset";
  title: string;
  text: string;
}) {
  const highlights =
    mode === "signup"
      ? [
          "Seu perfil acadêmico em poucos minutos",
          "Preferências de acessibilidade no onboarding",
          "Dados protegidos por acesso individual",
        ]
      : [
          "Acesso seguro à comunidade escolar",
          "Alertas de suporte permanecem privados",
          "Sua sessão fica protegida neste dispositivo",
        ];

  return (
    <main
      id="conteudo"
      className="grid min-h-screen bg-canvas lg:grid-cols-[.9fr_1.1fr]"
    >
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <span
          aria-hidden
          className="absolute -right-28 top-1/4 size-80 rounded-full border-[56px] border-white/[.06]"
        />
        <BrandLogo className="text-xl" />
        <div className="relative max-w-lg">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-white/65">
            Um espaço que pertence à escola
          </p>
          <blockquote className="mt-5 max-w-lg font-display text-4xl font-bold leading-tight">
            Informação para participar. Cuidado para pertencer.
          </blockquote>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-3">
                <CheckCircle2 className="size-4 shrink-0 text-white" />{" "}
                {highlight}
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-2 text-sm text-white/70">
          <LockKeyhole className="size-4" /> CETEP · Itaberaba, Bahia
        </p>
      </aside>
      <section className="grid place-items-center px-5 py-10 sm:px-8 lg:bg-paper">
        <div className="w-full max-w-md">
          <BrandLogo className="mb-10 text-brand lg:hidden" />
          <p className="eyebrow">Acesso à comunidade</p>
          <h1 className="page-title mt-2">{title}</h1>
          <p className="mb-8 mt-3 text-muted">{text}</p>
          <div className="rounded-2xl border border-line bg-paper p-5 shadow-lift sm:p-7 lg:border-0 lg:p-0 lg:shadow-none">
            <AuthForm mode={mode} />
          </div>
          <div className="mt-7 text-center text-sm text-muted">
            {mode === "login" ? (
              <>
                <Link className="font-bold text-brand" href="/recuperar-senha">
                  Esqueci minha senha
                </Link>
                <p className="mt-4">
                  Ainda não participa?{" "}
                  <Link className="font-bold text-brand" href="/cadastro">
                    Criar conta
                  </Link>
                </p>
              </>
            ) : (
              <Link className="font-bold text-brand" href="/login">
                Voltar para o login
              </Link>
            )}
          </div>
          <p className="mt-8 text-center text-xs leading-5 text-muted">
            Ao continuar, seus dados serão tratados conforme nossa{" "}
            <Link
              className="font-semibold underline-offset-4 hover:underline"
              href="/privacidade"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
