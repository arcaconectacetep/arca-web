"use client";

import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";

export function CheckboxField({ className = "", ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root {...props} className={`grid size-5 shrink-0 place-items-center rounded border border-line bg-control text-white outline-none data-[state=checked]:border-brand data-[state=checked]:bg-brand focus-visible:ring-3 focus-visible:ring-brand/30 disabled:opacity-50 ${className}`}>
      <CheckboxPrimitive.Indicator><Check className="size-3.5" strokeWidth={3} /></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
