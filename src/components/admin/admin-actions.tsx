"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  deleteUser,
  hidePost,
  restorePost,
  restoreUser,
  suspendUser,
  updateSupportAlertStatus,
  updateUserRole,
} from "@/app/actions";
import type { Role } from "@/types/database";
import { alertStatusLabels, labelFor, roleLabels } from "@/lib/labels";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
function notify(result: { ok: boolean; error?: string }, success: string) {
  if (result.ok) toast.success(success);
  else toast.error(result.error ?? "Não foi possível concluir a ação.");
}
export function RoleSelect({ id, value }: { id: string; value: Role }) {
  const [p, start] = useTransition();
  return (
    <select
      disabled={p}
      value={value}
      onChange={(e) =>
        start(async () => {
          const r = await updateUserRole(id, e.target.value as Role);
          notify(r, "Papel atualizado.");
        })
      }
      className="field w-auto"
    >
      {Object.entries(roleLabels).map(([role, label]) => (
        <option key={role} value={role}>{label}</option>
      ))}
    </select>
  );
}
export function DeleteUserButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className="btn-ghost text-danger hover:bg-danger/5 hover:text-danger"
      onClick={() => {
        const confirmed = window.confirm(
          `Excluir permanentemente a conta de ${name}? Publicações, comentários e solicitações dessa pessoa também serão removidos. Esta ação não pode ser desfeita.`,
        );
        if (!confirmed) return;
        start(async () => {
          const result = await deleteUser(id);
          notify(result, "Conta excluída da autenticação.");
        });
      }}
    >
      {pending && <LoadingSpinner label="Excluindo usuário" />}
      Excluir conta
    </button>
  );
}
export function UserToggle({
  id,
  suspended,
}: {
  id: string;
  suspended: boolean;
}) {
  const [p, start] = useTransition();
  return (
    <button
      disabled={p}
      className={suspended ? "btn-secondary" : "btn-ghost text-danger"}
      onClick={() =>
        confirm(suspended ? "Reativar usuário?" : "Suspender usuário?") &&
        start(async () => {
          const r = suspended ? await restoreUser(id) : await suspendUser(id);
          notify(r, "Usuário atualizado.");
        })
      }
    >
      {suspended ? "Reativar" : "Suspender"}
    </button>
  );
}
export function PostToggle({ id, hidden }: { id: string; hidden: boolean }) {
  const [p, start] = useTransition();
  return (
    <button
      disabled={p}
      className="btn-secondary"
      onClick={() =>
        confirm(hidden ? "Restaurar publicação?" : "Ocultar publicação?") &&
        start(async () => {
          const r = hidden ? await restorePost(id) : await hidePost(id);
          notify(r, "Publicação atualizada.");
        })
      }
    >
      {hidden ? "Restaurar" : "Ocultar"}
    </button>
  );
}
export function AlertStatus({ id, value }: { id: string; value: string }) {
  const [p, start] = useTransition();
  return (
    <select
      disabled={p}
      className="field w-auto"
      value={value}
      onChange={(e) =>
        start(async () => {
          const r = await updateSupportAlertStatus(id, e.target.value);
          notify(r, "Status atualizado.");
        })
      }
    >
      {[
        "RECEIVED",
        "UNDER_REVIEW",
        "CONTACT_ATTEMPTED",
        "FORWARDED",
        "RESOLVED",
        "ARCHIVED",
      ].map((x) => (
        <option key={x} value={x}>{labelFor(alertStatusLabels, x)}</option>
      ))}
    </select>
  );
}
