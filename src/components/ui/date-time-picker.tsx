"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SelectField } from "@/components/ui/select-field";

const hours = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour).padStart(2, "0"),
  label: `${String(hour).padStart(2, "0")}h`,
}));
const minutes = ["00", "15", "30", "45"].map((minute) => ({
  value: minute,
  label: minute,
}));

function parseLocal(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Escolher data e horário",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const selected = parseLocal(value);

  function commit(date: Date) {
    onChange(format(date, "yyyy-MM-dd'T'HH:mm"));
  }

  function updateTime(part: "hour" | "minute", next: string) {
    const date = selected ? new Date(selected) : new Date();
    if (part === "hour") date.setHours(Number(next));
    else date.setMinutes(Number(next));
    date.setSeconds(0, 0);
    commit(date);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="field flex items-center gap-3 text-left">
          <CalendarDays className="size-4 shrink-0 text-muted" aria-hidden />
          <span className={`min-w-0 flex-1 truncate ${selected ? "text-ink" : "text-muted"}`}>
            {selected
              ? format(selected, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })
              : placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] p-4">
        <DayPicker
          mode="single"
          locale={ptBR}
          selected={selected}
          onSelect={(day) => {
            if (!day) return;
            const next = new Date(day);
            next.setHours(selected?.getHours() ?? 12, selected?.getMinutes() ?? 0, 0, 0);
            commit(next);
          }}
          classNames={{
            root: "w-full",
            months: "w-full",
            month: "w-full space-y-4",
            month_caption: "flex h-10 items-center justify-center",
            caption_label: "text-sm font-bold capitalize",
            nav: "absolute inset-x-4 top-4 flex items-center justify-between",
            button_previous: "grid size-10 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-brand",
            button_next: "grid size-10 place-items-center rounded-lg text-muted hover:bg-canvas hover:text-brand",
            month_grid: "w-full border-collapse",
            weekdays: "grid grid-cols-7",
            weekday: "py-2 text-center text-[11px] font-bold uppercase text-muted",
            week: "mt-1 grid grid-cols-7",
            day: "grid place-items-center",
            day_button: "grid size-10 place-items-center rounded-lg text-sm font-semibold transition-colors hover:bg-brand-soft hover:text-brand focus-visible:outline focus-visible:outline-3 focus-visible:outline-brand/25",
            selected: "[&>button]:bg-brand [&>button]:text-white [&>button]:hover:bg-brand [&>button]:hover:text-white",
            today: "[&>button]:text-brand [&>button]:ring-1 [&>button]:ring-brand/25",
            outside: "opacity-35",
            disabled: "opacity-30",
          }}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
          <label>
            <span className="label">Hora</span>
            <SelectField
              value={String(selected?.getHours() ?? 12).padStart(2, "0")}
              onValueChange={(next) => updateTime("hour", next)}
              options={hours}
            />
          </label>
          <label>
            <span className="label">Minutos</span>
            <SelectField
              value={String(selected?.getMinutes() ?? 0).padStart(2, "0")}
              onValueChange={(next) => updateTime("minute", next)}
              options={minutes}
            />
          </label>
        </div>
        {selected && (
          <button
            type="button"
            className="btn-ghost mt-3 w-full text-xs"
            onClick={() => onChange("")}
          >
            Remover data e horário
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
