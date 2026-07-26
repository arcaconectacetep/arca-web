"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  hidePost,
  restorePost,
  restoreUser,
  suspendUser,
  updateSupportAlertStatus,
  updateUserRole,
} from "@/app/actions";
import type { Role } from "@/types/database";
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
      <option>STUDENT</option>
      <option>TEACHER</option>
      <option>STAFF</option>
      <option>ADMIN</option>
    </select>
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
        <option key={x}>{x}</option>
      ))}
    </select>
  );
}
