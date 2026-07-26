import { Feed } from "@/components/feed/feed";
export default function Page() {
  return (
    <section className="mx-auto max-w-3xl">
      <p className="eyebrow">Mural informativo</p>
      <h1 className="page-title mt-2">Informação para agir no tempo certo.</h1>
      <p className="mb-7 mt-3 text-muted">
        Notícias escolares, saúde, segurança, campanhas, eventos e prazos.
      </p>
      <Feed section="WALL" />
    </section>
  );
}
