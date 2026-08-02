"use client";

import { RadioGroup } from "radix-ui";

export function RadioGroupField({
  options,
  value,
  onValueChange,
  columns = 2,
  name,
}: {
  options: Array<{ value: string; label: string; description?: string }>;
  value: string;
  onValueChange: (value: string) => void;
  columns?: 2 | 3;
  name?: string;
}) {
  return (
    <RadioGroup.Root
      className={`grid gap-3 ${columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      value={value}
      onValueChange={onValueChange}
      name={name}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`group flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 transition-[border-color,background-color,box-shadow,transform] duration-150 hover:-translate-y-px hover:border-brand/35 hover:bg-brand-soft/40 ${
            value === option.value
              ? "border-brand bg-brand-soft shadow-[0_0_0_3px_hsl(var(--brand)/.07)]"
              : "border-line bg-paper"
          }`}
        >
          <RadioGroup.Item
            value={option.value}
            className="grid size-5 shrink-0 place-items-center rounded-full border border-line bg-canvas outline-none transition-colors group-hover:border-brand data-[state=checked]:border-brand focus-visible:ring-3 focus-visible:ring-brand/25"
          >
            <RadioGroup.Indicator className="size-2.5 rounded-full bg-brand" />
          </RadioGroup.Item>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{option.label}</span>
            {option.description && (
              <span className="mt-0.5 block text-xs leading-5 text-muted">
                {option.description}
              </span>
            )}
          </span>
        </label>
      ))}
    </RadioGroup.Root>
  );
}
