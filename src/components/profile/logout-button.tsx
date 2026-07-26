"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn-ghost mt-5 text-danger hover:bg-danger/5 hover:text-danger"
      onClick={() => {
        if (!window.confirm("Deseja realmente sair da sua conta neste dispositivo?")) return;
        start(async () => logout());
      }}
    >
      {pending ? <LoadingSpinner label="Saindo da conta" /> : <LogOut className="size-4" />}
      Sair da conta
    </button>
  );
}
