"use client";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
export function SubmitButton({
  children,
  className = "btn-primary",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={className}>
      {pending && <LoaderCircle className="size-4 animate-spin" />}
      {pending ? "Enviando…" : children}
    </button>
  );
}
