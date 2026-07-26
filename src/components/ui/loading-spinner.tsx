import { LoaderCircle } from "lucide-react";

export function LoadingSpinner({
  label = "Carregando",
  className = "size-4",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span role="status" className="inline-flex items-center justify-center">
      <LoaderCircle className={`${className} animate-spin`} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
