"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <ConfirmDialog
      title="Sair da conta?"
      description="Sua sessão será encerrada neste dispositivo. Você poderá entrar novamente quando quiser."
      confirmLabel="Sair"
      disabled={pending}
      onConfirm={() => start(async () => logout())}
      trigger={<button type="button" className="btn-ghost mt-5 text-danger hover:bg-danger/5 hover:text-danger">{pending ? <LoadingSpinner label="Saindo da conta" /> : <LogOut className="size-4" />}Sair da conta</button>}
    />
  );
}
