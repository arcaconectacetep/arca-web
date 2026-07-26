"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  children,
  className = "max-w-lg",
  title,
  description,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in motion-reduce:animate-none" />
      <DialogPrimitive.Content
        {...props}
        className={`fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-paper text-ink shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 motion-reduce:animate-none ${className}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <DialogPrimitive.Title className="text-xl font-bold">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="mt-2 text-sm leading-6 text-muted">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            className="grid size-11 shrink-0 place-items-center rounded-xl text-muted hover:bg-canvas hover:text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-brand/30"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        </header>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
