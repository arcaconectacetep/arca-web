import { Feed } from "@/components/feed/feed";
export default function Page() {
  return (
    <section className="mx-auto max-w-3xl">
      <p className="eyebrow">Espaço pedagógico</p>
      <h1 className="page-title mt-2">Aprender também é compartilhar.</h1>
      <p className="mb-7 mt-3 text-muted">
        Resumos, materiais, dúvidas e contribuições de cada curso.
      </p>
      <Feed section="PEDAGOGICAL" />
    </section>
  );
}
