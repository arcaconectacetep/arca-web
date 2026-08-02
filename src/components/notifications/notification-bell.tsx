"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip } from "@/components/ui/tooltip";

const MotionLink = motion.create(Link);

export function NotificationBell({ count }: { count: number }) {
  const label = count
    ? `${count} ${count === 1 ? "notificação não lida" : "notificações não lidas"}`
    : "Notificações";

  return (
    <Tooltip content={label}>
      <MotionLink
        href="/notificacoes"
        aria-label={label}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.94 }}
        className="relative grid size-11 place-items-center rounded-xl border border-line/70 bg-canvas transition-[background-color,box-shadow] hover:bg-brand-soft hover:shadow-quiet"
      >
        <Bell className="size-5" />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 460, damping: 26 }}
            className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-canvas"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </MotionLink>
    </Tooltip>
  );
}
