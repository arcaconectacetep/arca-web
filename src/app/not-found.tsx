import Link from "next/link";
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <div className="text-center">
        <p className="eyebrow">Erro 404</p>
        <h1 className="page-title mt-2">Esta página não foi encontrada.</h1>
        <Link href="/inicio" className="btn-primary mt-6">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
