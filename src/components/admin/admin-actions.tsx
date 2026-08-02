"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { deleteUser, hideComment, hidePost, restoreComment, restorePost, restoreUser, suspendUser, updateSupportAlertStatus, updateUserRole } from "@/app/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SelectField } from "@/components/ui/select-field";
import { alertStatusLabels, labelFor, roleLabels } from "@/lib/labels";
import type { Role } from "@/types/database";

function notify(result: { ok: boolean; error?: string }, success: string) {
  if (result.ok) toast.success(success);
  else toast.error(result.error ?? "Não foi possível concluir a ação.");
}

export function RoleSelect({ id, value, locked = false }: { id: string; value: Role; locked?: boolean }) {
  const [pending, start] = useTransition();
  return <SelectField disabled={pending || locked} aria-label="Papel do usuário" value={value} onValueChange={(role) => start(async () => notify(await updateUserRole(id, role as Role), "Papel atualizado."))} className="w-auto" options={Object.entries(roleLabels).map(([role, label]) => ({ value: role, label }))} />;
}

export function DeleteUserButton({ id, name, disabled = false }: { id: string; name: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  return <ConfirmDialog destructive disabled={pending || disabled} title={`Excluir a conta de ${name}?`} description="Publicações, comentários e solicitações dessa pessoa também serão removidos permanentemente. Esta ação não pode ser desfeita." confirmLabel="Excluir conta" onConfirm={() => start(async () => notify(await deleteUser(id), "Conta excluída da autenticação."))} trigger={<button type="button" className="btn-ghost text-danger hover:bg-danger/5 hover:text-danger">{pending && <LoadingSpinner label="Excluindo usuário" />}Excluir conta</button>} />;
}

export function UserToggle({ id, suspended, disabled = false }: { id: string; suspended: boolean; disabled?: boolean }) {
  const [pending, start] = useTransition();
  return <ConfirmDialog disabled={pending || disabled} destructive={!suspended} title={suspended ? "Reativar usuário?" : "Suspender usuário?"} description={suspended ? "O acesso e as permissões atuais serão restaurados." : "A pessoa perderá o acesso até que um administrador reative a conta."} confirmLabel={suspended ? "Reativar" : "Suspender"} onConfirm={() => start(async () => notify(suspended ? await restoreUser(id) : await suspendUser(id), "Usuário atualizado."))} trigger={<button type="button" className={suspended ? "btn-secondary" : "btn-ghost text-danger"}>{suspended ? "Reativar" : "Suspender"}</button>} />;
}

export function PostToggle({ id, hidden }: { id: string; hidden: boolean }) {
  const [pending, start] = useTransition();
  return <ConfirmDialog disabled={pending} destructive={!hidden} title={hidden ? "Restaurar publicação?" : "Ocultar publicação?"} description={hidden ? "A publicação voltará a aparecer para a comunidade." : "A publicação deixará de aparecer para a comunidade até ser restaurada."} confirmLabel={hidden ? "Restaurar" : "Ocultar"} onConfirm={() => start(async () => notify(hidden ? await restorePost(id) : await hidePost(id), "Publicação atualizada."))} trigger={<button type="button" className="btn-secondary">{hidden ? "Restaurar" : "Ocultar"}</button>} />;
}

export function CommentToggle({ id, hidden }: { id: string; hidden: boolean }) {
  const [pending, start] = useTransition();
  return <ConfirmDialog disabled={pending} destructive={!hidden} title={hidden ? "Restaurar comentário?" : "Ocultar comentário?"} description={hidden ? "O comentário voltará a aparecer na conversa." : "O comentário deixará de aparecer e as denúncias abertas serão marcadas como resolvidas."} confirmLabel={hidden ? "Restaurar" : "Ocultar"} onConfirm={() => start(async () => notify(hidden ? await restoreComment(id) : await hideComment(id), "Comentário atualizado."))} trigger={<button type="button" className={hidden ? "btn-secondary" : "btn-danger"}>{pending && <LoadingSpinner label="Atualizando comentário" />}{hidden ? "Restaurar" : "Ocultar"}</button>} />;
}

export function AlertStatus({ id, value }: { id: string; value: string }) {
  const [pending, start] = useTransition();
  const statuses = ["RECEIVED", "UNDER_REVIEW", "CONTACT_ATTEMPTED", "FORWARDED", "RESOLVED", "ARCHIVED"];
  return <SelectField disabled={pending} value={value} onValueChange={(status) => start(async () => notify(await updateSupportAlertStatus(id, status), "Status atualizado."))} className="w-auto" options={statuses.map((status) => ({ value: status, label: labelFor(alertStatusLabels, status) }))} />;
}
