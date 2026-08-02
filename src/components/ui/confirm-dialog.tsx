"use client";

import { AlertDialog } from "radix-ui";
import type { ReactNode } from "react";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive = false,
  disabled = false,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  destructive?: boolean;
  disabled?: boolean;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild disabled={disabled}>
        {trigger}
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[70] bg-ink/55 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:duration-150 data-[state=open]:duration-200 motion-reduce:animate-none" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[71] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line/70 bg-paper p-6 text-ink shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:duration-150 data-[state=open]:duration-200 motion-reduce:animate-none">
          <AlertDialog.Title className="text-xl font-bold">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-3 text-sm leading-6 text-muted">
            {description}
          </AlertDialog.Description>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel className="btn-ghost">Cancelar</AlertDialog.Cancel>
            <AlertDialog.Action
              className={destructive ? "btn-danger" : "btn-primary"}
              onClick={onConfirm}
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
