const APP_TIME_ZONE = "America/Sao_Paulo";

export function formatAppDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  },
) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: APP_TIME_ZONE,
    ...options,
  }).format(new Date(value));
}

export function formatAppDateTime(value: string | Date) {
  return formatAppDate(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatAppMonthYear(value: string | Date) {
  return formatAppDate(value, { month: "long", year: "numeric" });
}
