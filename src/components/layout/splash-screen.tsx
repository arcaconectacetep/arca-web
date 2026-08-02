"use client";

import { useEffect, useState } from "react";
import { BookOpen, HeartHandshake, Lightbulb, ShieldCheck } from "lucide-react";

const MINIMUM_VISIBLE_MS = 3000;
const EXIT_ANIMATION_MS = 280;

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("arca-splash-seen")) {
      setVisible(false);
      return;
    }
    const started = performance.now();
    let finishTimeout: number | undefined;
    let exitTimeout: number | undefined;
    const finish = () => {
      const remaining = Math.max(
        0,
        MINIMUM_VISIBLE_MS - (performance.now() - started),
      );
      finishTimeout = window.setTimeout(() => {
        sessionStorage.setItem("arca-splash-seen", "1");
        setClosing(true);
        exitTimeout = window.setTimeout(
          () => setVisible(false),
          EXIT_ANIMATION_MS,
        );
      }, remaining);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    return () => {
      window.removeEventListener("load", finish);
      if (finishTimeout !== undefined) window.clearTimeout(finishTimeout);
      if (exitTimeout !== undefined) window.clearTimeout(exitTimeout);
    };
  }, []);
  if (!visible) return null;
  const icons = [BookOpen, ShieldCheck, HeartHandshake, Lightbulb];
  return (
    <div className={`splash ${closing ? "splash-closing" : ""}`} role="status" aria-live="polite" aria-label="Preparando o ARCA">
      <div className="splash-orbit" aria-hidden>
        {icons.map((Icon, index) => <span className={`splash-node splash-node-${index + 1}`} key={index}><Icon className="size-5" /></span>)}
        <div className="splash-brand"><strong>ARCA</strong><span>ConectaARCA</span></div>
      </div>
      <p>Preparando seu espaço</p>
      <span className="splash-progress" aria-hidden><i /></span>
    </div>
  );
}
