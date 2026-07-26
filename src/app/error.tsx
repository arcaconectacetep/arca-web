"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <div className="card max-w-md p-8 text-center">
        <h1 className="section-title">Algo não saiu como esperado.</h1>
        <p className="mt-3 text-muted">
          Tente novamente. Nenhum detalhe interno foi exposto.
        </p>
        <button onClick={reset} className="btn-primary mt-6">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
