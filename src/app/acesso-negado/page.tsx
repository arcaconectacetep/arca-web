import Link from "next/link";
import { ShieldX } from "lucide-react";
export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <div className="card max-w-md p-8 text-center">
        <ShieldX className="mx-auto size-10 text-danger" />
        <h1 className="section-title mt-4">Acesso não autorizado</h1>
        <p className="mt-2 text-muted">
          Sua conta não possui permissão para acessar esta área ou está
          temporariamente suspensa.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Ir para a página inicial
        </Link>
      </div>
    </main>
  );
}
