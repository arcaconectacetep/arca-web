"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function LogoutButton({ className = "" }: { className?: string }) {
  const [pending, start] = useTransition();
  return (
    <ConfirmDialog
      title="Sair da conta?"
      description="Sua sessão será encerrada neste dispositivo. Você poderá entrar novamente quando quiser."
      confirmLabel="Sair"
      disabled={pending}
      onConfirm={() => start(async () => logout())}
      trigger={<button type="button" className={`btn-secondary text-danger hover:bg-danger/10 hover:text-danger ${className}`}>{pending ? <LoadingSpinner label="Saindo da conta" /> : <LogOut className="size-4" />}Sair da conta</button>}
    />
  );
}
