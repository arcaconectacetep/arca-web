export default function Loading() {
  return (
    <div
      aria-label="Carregando"
      className="mx-auto max-w-3xl animate-pulse space-y-5 p-6"
    >
      <div className="h-9 w-2/3 rounded bg-line" />
      <div className="h-40 rounded-2xl bg-line" />
      <div className="h-64 rounded-2xl bg-line" />
    </div>
  );
}
