"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Accessibility,
  Camera,
  Eye,
  EyeOff,
  LogOut,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  removeAvatar,
  deleteOwnAccount,
  updatePreferences,
  updatePublicProfile,
  updatePassword,
} from "@/app/actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { prepareImageForUpload } from "@/lib/prepare-image";
import { LogoutButton } from "@/components/profile/logout-button";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SelectField } from "@/components/ui/select-field";
import { Turnstile } from "@/components/security/turnstile";
import { colorModeOptions, fontFamilyOptions, fontScaleOptions, shiftOptions, themeOptions } from "@/lib/appearance-options";

type SettingsProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  class_name: string | null;
  shift: string | null;
  theme: string;
  color_mode: string;
  font_family: string;
  high_contrast: boolean;
  reduced_motion: boolean;
  font_scale: number;
};

function SectionHeading({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof UserRound;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-0.5 text-sm leading-6 text-muted">{text}</p>
      </div>
    </div>
  );
}

export function SettingsForm({ profile }: { profile: SettingsProfile }) {
  const router = useRouter();
  const [avatar, setAvatar] = useState(profile.avatar_url);
  const [showPasswords, setShowPasswords] = useState(false);
  const [avatarPending, startAvatar] = useTransition();
  const [publicPending, startPublic] = useTransition();
  const [preferencesPending, startPreferences] = useTransition();
  const [passwordPending, startPassword] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const [deleteCaptchaToken, setDeleteCaptchaToken] = useState("");
  const [deleteCaptchaNonce, setDeleteCaptchaNonce] = useState(0);
  const deleteForm = useRef<HTMLFormElement>(null);

  function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return toast.error("Escolha uma imagem JPEG, PNG ou WebP.");
    if (file.size <= 0 || file.size > 5 * 1024 * 1024)
      return toast.error("A imagem deve ter no máximo 5 MB.");
    startAvatar(async () => {
      try {
        const form = new FormData();
        form.set("file", await prepareImageForUpload(file, 1200));
        form.set("kind", "avatar");
        const response = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });
        const result = (await response.json().catch(() => null)) as {
          error?: string;
          imageUrl?: string;
          cleanupWarning?: boolean;
        } | null;
        if (!response.ok || !result?.imageUrl)
          throw new Error(
            result?.error ??
              (response.status === 413
                ? "A imagem excedeu o limite do servidor."
                : "Não foi possível enviar a imagem."),
          );
        setAvatar(result.imageUrl);
        if (result.cleanupWarning)
          toast.warning("Foto atualizada, mas o provedor não confirmou a exclusão do arquivo anterior.");
        else toast.success("Imagem do perfil atualizada.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Falha no upload.",
        );
      }
    });
  }

  function remove() {
    startAvatar(async () => {
      const result = await removeAvatar();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setAvatar(null);
      toast.success("Foto de perfil removida.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <SectionHeading
          icon={Camera}
          title="Foto do perfil"
          text="Aparece nas suas publicações, comentários e perfil público."
        />
        <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-soft text-brand ring-4 ring-paper shadow-quiet">
            {avatar ? (
              <Image
                src={avatar}
                alt="Avatar atual"
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <UserRound className="size-9" aria-hidden />
            )}
            {avatarPending && (
              <span className="absolute inset-0 grid place-items-center bg-ink/55 text-white">
                <LoadingSpinner label="Atualizando avatar" className="size-6" />
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-muted">
              JPEG, PNG ou WebP, até 5 MB. Imagens grandes são otimizadas
              automaticamente.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <label
                className={`btn-secondary cursor-pointer ${avatarPending ? "pointer-events-none opacity-50" : ""}`}
              >
                {avatarPending ? (
                  <LoadingSpinner />
                ) : (
                  <Upload className="size-4" />
                )}
                {avatar ? "Trocar foto" : "Escolher foto"}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={avatarPending}
                  onChange={(event) => upload(event.target.files?.[0])}
                />
              </label>
              {avatar && (
                <ConfirmDialog destructive disabled={avatarPending} title="Remover foto de perfil?" description="Seu avatar voltará a mostrar as iniciais do seu nome." confirmLabel="Remover foto" onConfirm={remove} trigger={<button className="btn-ghost text-danger hover:bg-danger/5 hover:text-danger" type="button">
                  <Trash2 className="size-4" />
                  Remover foto
                </button>} />
              )}
            </div>
          </div>
        </div>
      </section>

      <div
        className="space-y-6"
      >
        <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          startPublic(async () => {
            const result = await updatePublicProfile({
              fullName: String(form.get("fullName")),
              bio: String(form.get("bio")),
              className: String(form.get("className")),
              shift: String(form.get("shift")),
            });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Informações públicas atualizadas.");
            router.refresh();
          });
        }}
        className="card p-5 sm:p-6"
      >
          <SectionHeading
            icon={UserRound}
            title="Informações públicas"
            text="Controle como você é apresentado à comunidade escolar."
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="label">Nome completo</span>
              <input
                className="field"
                name="fullName"
                required
                minLength={3}
                maxLength={100}
                defaultValue={profile.full_name ?? ""}
              />
            </label>
            <label>
              <span className="label">Username</span>
              <div className="field flex items-center text-muted">
                <span>@{profile.username}</span>
              </div>
              <small className="mt-1 block text-muted">
                O username não pode ser alterado aqui.
              </small>
            </label>
            <label>
              <span className="label">Turma</span>
              <input
                className="field"
                name="className"
                maxLength={50}
                defaultValue={profile.class_name ?? ""}
                placeholder="Ex.: 3º INFO A"
              />
            </label>
            <label>
              <span className="label">Turno</span>
              <SelectField name="shift" defaultValue={profile.shift ?? ""} options={[...shiftOptions]} />
            </label>
            <label className="sm:col-span-2">
              <span className="label">Biografia</span>
              <textarea
                className="field min-h-28 resize-y"
                name="bio"
                maxLength={500}
                defaultValue={profile.bio ?? ""}
                placeholder="Conte um pouco sobre seus interesses e projetos."
              />
              <small className="mt-1 block text-muted">
                Até 500 caracteres. Não inclua dados pessoais sensíveis.
              </small>
            </label>
          </div>
          <button className="btn-primary mt-6" disabled={publicPending}>
            {publicPending ? <LoadingSpinner label="Salvando informações" /> : <Save className="size-4" />}
            {publicPending ? "Salvando…" : "Salvar informações públicas"}
          </button>
        </form>

        <form
          className="card p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            startPreferences(async () => {
              const result = await updatePreferences({
                theme: String(form.get("theme")),
                colorMode: String(form.get("colorMode")),
                fontFamily: String(form.get("fontFamily")),
                highContrast: form.get("highContrast") === "on",
                reducedMotion: form.get("reducedMotion") === "on",
                fontScale: Number(form.get("fontScale")),
              });
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              toast.success("Preferências salvas.");
              router.refresh();
            });
          }}
        >
          <SectionHeading
            icon={Accessibility}
            title="Aparência e acessibilidade"
            text="Essas preferências acompanham sua conta em qualquer dispositivo."
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="label">Tema visual</span>
              <SelectField name="theme" defaultValue={profile.theme} options={[...themeOptions]} />
            </label>
            <label>
              <span className="label">Modo de cor</span>
              <SelectField name="colorMode" defaultValue={profile.color_mode} options={[...colorModeOptions]} />
            </label>
            <label>
              <span className="label">Fonte</span>
              <SelectField name="fontFamily" defaultValue={profile.font_family} options={[...fontFamilyOptions]} />
            </label>
            <label>
              <span className="label">Tamanho da fonte</span>
              <SelectField name="fontScale" defaultValue={String(profile.font_scale)} options={[...fontScaleOptions]} />
            </label>
            <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas p-4">
              <CheckboxField name="highContrast" value="on" defaultChecked={profile.high_contrast} />
              <span>
                <b className="block text-sm">Alto contraste</b>
                <small className="text-muted">
                  Reforça textos, bordas e foco.
                </small>
              </span>
            </label>
            <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas p-4">
              <CheckboxField name="reducedMotion" value="on" defaultChecked={profile.reduced_motion} />
              <span>
                <b className="block text-sm">Reduzir movimento</b>
                <small className="text-muted">
                  Remove deslocamentos e animações.
                </small>
              </span>
            </label>
          </div>
          <button className="btn-primary mt-6" disabled={preferencesPending}>
            {preferencesPending ? (
              <LoadingSpinner label="Salvando preferências" />
            ) : (
              <Save className="size-4" />
            )}
            {preferencesPending ? "Salvando…" : "Salvar preferências"}
          </button>
        </form>
      </div>

      <form
        action={(form) =>
          startPassword(async () => {
            const result = await updatePassword(form);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Senha alterada com segurança.");
            setShowPasswords(false);
          })
        }
        className="card p-5 sm:p-6"
      >
        <SectionHeading
          icon={ShieldCheck}
          title="Segurança"
          text="Use uma senha diferente das utilizadas em outros serviços."
        />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label>
            <span className="label">Nova senha</span>
            <input
              className="field"
              name="password"
              type={showPasswords ? "text" : "password"}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            <span className="label">Confirmar nova senha</span>
            <input
              className="field"
              name="confirmPassword"
              type={showPasswords ? "text" : "password"}
              minLength={8}
              autoComplete="new-password"
              required
            />
          </label>
        </div>
        <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-muted">
          <CheckboxField checked={showPasswords} onCheckedChange={(checked) => setShowPasswords(checked === true)} />
          {showPasswords ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
          Mostrar senhas
        </label>
        <div>
          <button className="btn-secondary mt-3" disabled={passwordPending}>
            {passwordPending && <LoadingSpinner label="Alterando senha" />}
            Alterar senha
          </button>
        </div>
      </form>

      <section className="card border border-danger/15 p-5 sm:p-6">
        <SectionHeading
          icon={LogOut}
          title="Sessão"
          text="Encerre o acesso ao ConectaARCA neste dispositivo."
        />
        <LogoutButton />
        <CookieSettingsButton className="btn-secondary mt-5" />
      </section>

      <form
        ref={deleteForm}
        className="card border border-danger/25 p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          startDelete(async () => {
            const result = await deleteOwnAccount({ password: String(form.get("deletePassword")), confirmation: String(form.get("confirmation")), captchaToken: deleteCaptchaToken });
            if (!result.ok) {
              toast.error(result.error);
              setDeleteCaptchaToken("");
              setDeleteCaptchaNonce((value) => value + 1);
              return;
            }
            window.location.assign("/");
          });
        }}
      >
        <SectionHeading icon={Trash2} title="Excluir minha conta" text="Remove permanentemente seu perfil, publicações, comentários e solicitações de suporte." />
        <div className="mt-5 rounded-xl bg-danger/5 p-4 text-sm leading-6 text-danger"><b>Esta ação não pode ser desfeita.</b> Se precisar apenas interromper o acesso, saia da conta. Excluir o único ADMIN deixará o sistema sem acesso administrativo até que outro usuário seja promovido diretamente no banco.</div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="label">Senha atual</span><input className="field" type="password" name="deletePassword" autoComplete="current-password" required /></label><label><span className="label">Digite EXCLUIR MINHA CONTA</span><input className="field" name="confirmation" required autoComplete="off" /></label></div>
        <div className="mt-5"><Turnstile key={deleteCaptchaNonce} onToken={setDeleteCaptchaToken} /></div>
        <ConfirmDialog destructive disabled={deletePending || !deleteCaptchaToken} title="Excluir permanentemente sua conta?" description="Seu perfil, publicações, comentários e solicitações vinculadas serão removidos. Esta ação não pode ser desfeita." confirmLabel="Excluir minha conta" onConfirm={() => deleteForm.current?.requestSubmit()} trigger={<button type="button" className="btn-danger mt-5">{deletePending ? <LoadingSpinner label="Excluindo conta" /> : <Trash2 className="size-4" />}{deletePending ? "Excluindo…" : "Excluir permanentemente"}</button>} />
      </form>
    </div>
  );
}
