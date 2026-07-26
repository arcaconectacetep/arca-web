"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { logout, updatePassword } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
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
    start(async () => {
      try {
        const fd = new FormData();
        fd.set("file", file);
        fd.set("kind", "avatar");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        const db = createClient();
        const { error } = await db
          .from("profiles")
          .update({ avatar_url: result.imageUrl })
          .eq("id", profile.id);
        if (error) throw error;
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
        {avatar && (
          <Image
            src={avatar}
            alt="Avatar atual"
            width={96}
            height={96}
            className="mt-4 size-24 rounded-full object-cover"
          />
        )}
        <label className="btn-secondary mt-4 cursor-pointer">
          {pending ? "Enviando…" : "Escolher imagem"}
          <input
            type="file"
            className="sr-only"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </label>
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
