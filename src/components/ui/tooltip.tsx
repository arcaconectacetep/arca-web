"use client";

import { Tooltip as TooltipPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";

export function Tooltip({
  children,
  content,
  side = "bottom",
}: {
  children: ReactNode;
  content: ReactNode;
  side?: ComponentProps<typeof TooltipPrimitive.Content>["side"];
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={350} skipDelayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={7}
            collisionPadding={12}
            className="z-[90] rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-paper shadow-lift data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 motion-reduce:animate-none"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-ink" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
