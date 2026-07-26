"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { logout, updatePassword } from "@/app/actions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { prepareImageForUpload } from "@/lib/prepare-image";
export function SettingsForm({
  profile,
}: {
  profile: {
    id: string;
    avatar_url: string | null;
    theme: string;
    high_contrast: boolean;
    reduced_motion: boolean;
    font_scale: number;
  };
}) {
  const [pending, start] = useTransition();
  const [avatar, setAvatar] = useState(profile.avatar_url);
  function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Escolha uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (file.size <= 0 || file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }
    start(async () => {
      try {
        const fd = new FormData();
        fd.set("file", await prepareImageForUpload(file, 1200));
        fd.set("kind", "avatar");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const result = (await res.json().catch(() => null)) as {
          error?: string;
          imageUrl?: string;
        } | null;
        if (!res.ok || !result?.imageUrl)
          throw new Error(
            result?.error ??
              (res.status === 413
                ? "A imagem excedeu o limite do servidor."
                : "Não foi possível enviar a imagem."),
          );
        setAvatar(result.imageUrl);
        toast.success("Avatar atualizado.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Falha no upload.");
      }
    });
  }
  return (
    <div className="space-y-5">
      <section className="card p-6">
        <h2 className="section-title">Imagem do perfil</h2>
        <p className="mt-1 text-sm text-muted">JPEG, PNG ou WebP, até 5 MB.</p>
        <div className="mt-5 flex flex-wrap items-center gap-5">
          <div className="relative grid size-24 place-items-center overflow-hidden rounded-full bg-brand-soft text-brand ring-4 ring-paper shadow-quiet">
            {avatar ? (
              <Image
                src={avatar}
                alt="Avatar atual"
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <Camera className="size-8" aria-hidden />
            )}
            {pending && (
              <span className="absolute inset-0 grid place-items-center bg-ink/55 text-white">
                <LoadingSpinner label="Enviando avatar" className="size-6" />
              </span>
            )}
          </div>
          <label
            className={`btn-secondary cursor-pointer ${pending ? "pointer-events-none opacity-50" : ""}`}
          >
            {pending ? (
              <LoadingSpinner label="Enviando avatar" />
            ) : (
              <Upload className="size-4" />
            )}
            {pending
              ? "Enviando…"
              : avatar
                ? "Trocar imagem"
                : "Escolher imagem"}
            <input
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/webp"
              disabled={pending}
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </label>
        </div>
      </section>
      <form
        action={async (fd) => {
          const r = await updatePassword(fd);
          if (r.ok) toast.success("Senha alterada.");
          else toast.error(r.error);
        }}
        className="card p-6"
      >
        <h2 className="section-title">Segurança</h2>
        <label className="mt-4 block">
          <span className="label">Nova senha</span>
          <input
            className="field"
            name="password"
            type="password"
            minLength={8}
            required
          />
        </label>
        <button className="btn-primary mt-4">Alterar senha</button>
      </form>
      <form action={logout} className="card p-6">
        <h2 className="section-title">Sessão</h2>
        <p className="mt-1 text-sm text-muted">
          Encerre seu acesso neste dispositivo.
        </p>
        <button className="btn-secondary mt-4">Sair da conta</button>
      </form>
    </div>
  );
}
