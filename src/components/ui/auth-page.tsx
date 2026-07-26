import Link from "next/link";
import { AuthForm } from "./auth-form";
export function AuthPage({
  mode,
  title,
  text,
}: {
  mode: "login" | "signup" | "recover" | "reset";
  title: string;
  text: string;
}) {
  return (
    <main id="conteudo" className="grid min-h-screen lg:grid-cols-[.9fr_1.1fr]">
      <aside className="hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-xl font-bold">
          ConectaCETEP
        </Link>
        <blockquote className="max-w-lg font-display text-4xl leading-tight">
          “Uma escola conectada escuta, compartilha e transforma junto.”
        </blockquote>
        <p className="text-sm text-white/70">CETEP · Itaberaba, Bahia</p>
      </aside>
      <section className="grid place-items-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-12 inline-block font-bold text-brand lg:hidden"
          >
            ConectaCETEP
          </Link>
          <p className="eyebrow">Acesso à comunidade</p>
          <h1 className="page-title mt-2">{title}</h1>
          <p className="mb-8 mt-3 text-muted">{text}</p>
          <AuthForm mode={mode} />
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
        </div>
      </section>
    </main>
  );
}
