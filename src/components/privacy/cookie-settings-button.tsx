"use client";

export function CookieSettingsButton({ className = "font-semibold hover:text-brand" }: { className?: string }) {
  return <button className={className} type="button" onClick={() => window.dispatchEvent(new Event("arca:cookie-settings"))}>Preferências de cookies</button>;
}
