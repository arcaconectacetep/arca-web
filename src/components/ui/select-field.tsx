"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ComponentProps } from "react";

const EMPTY_VALUE = "__radix_empty_value__";

export function SelectField({
  options,
  placeholder = "Selecione",
  className = "",
  name,
  value,
  defaultValue,
  onValueChange,
  required = false,
  "aria-label": ariaLabel,
  ...props
}: Omit<ComponentProps<typeof SelectPrimitive.Root>, "name" | "value" | "defaultValue" | "onValueChange"> & {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  required?: boolean;
  "aria-label"?: string;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const selectedValue = value ?? internalValue;
  const radixValue = selectedValue === "" ? EMPTY_VALUE : selectedValue;
  return (
    <SelectPrimitive.Root {...props} value={radixValue} onValueChange={(nextValue) => { const normalized = nextValue === EMPTY_VALUE ? "" : nextValue; if (value === undefined) setInternalValue(normalized); onValueChange?.(normalized); }}>
      {name && <input type="hidden" name={name} value={selectedValue} required={required} />}
      <SelectPrimitive.Trigger aria-label={ariaLabel} className={`field flex min-h-11 items-center justify-between gap-3 text-left ${className}`}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon><ChevronDown className="size-4 text-muted" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={6} collisionPadding={12} className="z-[80] max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-line bg-paper text-ink shadow-lift data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 motion-reduce:animate-none">
          <SelectPrimitive.Viewport className="p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item key={option.value || EMPTY_VALUE} value={option.value || EMPTY_VALUE} className="relative flex min-h-10 cursor-pointer select-none items-center rounded-lg py-2 pl-9 pr-3 text-sm outline-none data-[highlighted]:bg-canvas data-[state=checked]:font-bold">
                <SelectPrimitive.ItemIndicator className="absolute left-3"><Check className="size-4 text-brand" /></SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
