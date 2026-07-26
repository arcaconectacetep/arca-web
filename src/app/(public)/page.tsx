import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HeartHandshake,
  Lightbulb,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";
const areas = [
  {
    icon: Users,
    title: "Feed escolar",
    text: "A vida do CETEP em um fluxo claro e participativo.",
  },
  {
    icon: BookOpen,
    title: "Espaço pedagógico",
    text: "Conteúdos e trocas que acompanham cada curso.",
  },
  {
    icon: Megaphone,
    title: "Mural informativo",
    text: "Prazos, campanhas, saúde e segurança em destaque.",
  },
  {
    icon: Lightbulb,
    title: "Tendências",
    text: "Projetos, cultura, tecnologia e oportunidades.",
  },
  {
    icon: HeartHandshake,
    title: "Canal de suporte",
    text: "Acolhimento privado, responsável e rastreável.",
  },
];
export default function Landing() {
  return (
    <>
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-extrabold">
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-white">
            C
          </span>
          ConectaCETEP
        </Link>
        <nav className="flex items-center gap-2">
          <Link className="btn-ghost hidden sm:inline-flex" href="/login">
            Entrar
          </Link>
          <Link className="btn-primary" href="/cadastro">
            Criar conta
          </Link>
        </nav>
      </header>
      <main id="conteudo">
        <section className="relative overflow-hidden border-y border-line bg-paper">
          <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="eyebrow mb-5">Comunidade acadêmica · Itaberaba</p>
              <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[.98] md:text-7xl">
                Informação, aprendizado e acolhimento em um só espaço.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
                O ConectaCETEP conecta estudantes, professores e projetos,
                fortalecendo a comunicação, a inclusão e o cuidado dentro da
                comunidade escolar.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/cadastro" className="btn-primary">
                  Fazer parte <ArrowRight className="size-4" />
                </Link>
                <Link href="/login" className="btn-secondary">
                  Já tenho uma conta
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute bottom-8 left-5 top-8 w-0.5 bg-brand-soft" />
              <div className="card relative space-y-1 p-6">
                <p className="eyebrow">Hoje no CETEP</p>
                <h2 className="section-title mt-2">Um percurso conectado</h2>
                {[
                  "Comunicado da coordenação",
                  "Material de Segurança do Trabalho",
                  "Projeto de economia criativa",
                  "Acolhimento sempre disponível",
                ].map((x, i) => (
                  <div
                    key={x}
                    className="relative flex items-center gap-4 border-b border-line py-4 last:border-0"
                  >
                    <span className="z-10 grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="font-semibold">{x}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-24">
          <p className="eyebrow">Cinco áreas, uma comunidade</p>
          <h2 className="page-title mt-3 max-w-2xl">
            Cada informação no lugar certo. Todas as pessoas no mesmo caminho.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {areas.map(({ icon: Icon, title, text }) => (
              <article className="card p-5" key={title}>
                <Icon className="size-6 text-brand" />
                <h3 className="mt-8 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="bg-brand text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2">
            <div>
              <ShieldCheck className="size-8" />
              <h2 className="mt-5 font-display text-4xl font-semibold">
                Inclusão que funciona na prática.
              </h2>
              <p className="mt-4 max-w-lg text-white/75">
                Alto contraste, ajuste de fonte e redução de movimento tornam a
                experiência mais confortável para diferentes necessidades.
              </p>
            </div>
            <div>
              <HeartHandshake className="size-8" />
              <h2 className="mt-5 font-display text-4xl font-semibold">
                Pedir ajuda é um ato de cuidado.
              </h2>
              <p className="mt-4 max-w-lg text-white/75">
                O canal privado orienta, gera protocolo e preserva as
                informações sensíveis fora de espaços públicos.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 ConectaCETEP · Protótipo acadêmico</span>
        <div className="flex gap-5">
          <Link href="/termos">Termos</Link>
          <Link href="/privacidade">Privacidade</Link>
        </div>
      </footer>
    </>
  );
}
