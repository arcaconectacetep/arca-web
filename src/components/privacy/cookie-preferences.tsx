"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { CheckboxField } from "@/components/ui/checkbox-field";
import { Collapsible } from "radix-ui";

const COOKIE_NAME = "arca_cookie_consent";
function save(value: "essential" | "personalization") {
  document.cookie = `${COOKIE_NAME}=${value}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
}
export function CookiePreferences() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [personalization, setPersonalization] = useState(false);
  useEffect(() => {
    setOpen(!document.cookie.includes(`${COOKIE_NAME}=`));
    const reopen = () => setOpen(true);
    window.addEventListener("arca:cookie-settings", reopen);
    return () => window.removeEventListener("arca:cookie-settings", reopen);
  }, []);
  if (!open) return null;
  const accept = (value: "essential" | "personalization") => { save(value); setOpen(false); };
  return (
    <Collapsible.Root open={details} onOpenChange={setDetails} asChild>
    <aside className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-2xl rounded-2xl border border-line bg-paper p-5 shadow-lift" aria-labelledby="cookie-title">
      <div className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Cookie className="size-5" /></span><div className="min-w-0 flex-1"><h2 id="cookie-title" className="font-bold">Privacidade no navegador</h2><p className="mt-1 text-sm leading-6 text-muted">Usamos recursos essenciais para sessão e segurança. Preferências opcionais podem manter escolhas visuais neste dispositivo.</p></div><button className="grid size-10 place-items-center rounded-xl text-muted hover:bg-canvas" onClick={() => accept("essential")} aria-label="Fechar e usar apenas recursos essenciais"><X className="size-5" /></button></div>
      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none"><div className="mt-4 space-y-3 rounded-xl bg-canvas p-4 text-sm"><label className="flex items-center justify-between gap-4"><span><b className="block">Essenciais</b><small className="text-muted">Login, segurança e preferências de consentimento.</small></span><CheckboxField checked disabled /></label><label className="flex cursor-pointer items-center justify-between gap-4"><span><b className="block">Personalização</b><small className="text-muted">Tema e experiência visual neste navegador.</small></span><CheckboxField checked={personalization} onCheckedChange={(checked) => setPersonalization(checked === true)} /></label><p className="text-xs text-muted">Não utilizamos cookies de publicidade ou análise. <Link className="font-bold text-brand" href="/privacidade">Ler Política de Privacidade</Link></p></div></Collapsible.Content>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end"><Collapsible.Trigger className="btn-ghost">{details ? "Ocultar opções" : "Configurar"}</Collapsible.Trigger><button className="btn-secondary" onClick={() => accept("essential")}>Somente essenciais</button><button className="btn-primary" onClick={() => accept(personalization ? "personalization" : "essential")}>Salvar preferências</button></div>
    </aside>
    </Collapsible.Root>
  );
}
