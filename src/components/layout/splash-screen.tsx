"use client";

import { useEffect, useState } from "react";
import { BookOpen, HeartHandshake, Lightbulb, ShieldCheck } from "lucide-react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("arca-splash-seen")) {
      setVisible(false);
      return;
    }
    const started = performance.now();
    const finish = () => {
      const remaining = Math.max(0, 550 - (performance.now() - started));
      window.setTimeout(() => {
        sessionStorage.setItem("arca-splash-seen", "1");
        setClosing(true);
        window.setTimeout(() => setVisible(false), 220);
      }, remaining);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
    return () => window.removeEventListener("load", finish);
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
