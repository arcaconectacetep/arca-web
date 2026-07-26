"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: Record<string, unknown>,
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!container.current || !window.turnstile || !siteKey || widgetId.current)
      return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      theme: "light",
      size: "flexible",
      language: "pt-BR",
      action: "authentication",
      callback: (token: string) => onToken(token),
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
    });
    setReady(true);
  }, [onToken, siteKey]);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetId.current && window.turnstile)
        window.turnstile.remove(widgetId.current);
    };
  }, [renderWidget]);

  if (!siteKey) {
    return (
      <p
        className="rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm font-medium text-danger"
        role="alert"
      >
        A proteção anti-robô não está configurada. Tente novamente mais tarde.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-canvas p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
        <ShieldCheck className="size-4 text-brand" />
        Verificação de segurança
      </div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div
        ref={container}
        className="min-h-[65px] w-full overflow-hidden"
        aria-busy={!ready}
      />
      {!ready && (
        <p className="mt-1 text-xs text-muted">
          Carregando proteção anti-robô…
        </p>
      )}
    </div>
  );
}
