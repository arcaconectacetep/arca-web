export const themeOptions = [
  { value: "DEFAULT", label: "Azul" },
  { value: "BLUE", label: "Azul profundo" },
  { value: "AURORA", label: "Aurora" },
  { value: "NEUTRAL", label: "Neutro" },
  { value: "FOREST", label: "Floresta" },
  { value: "OCEAN", label: "Oceano" },
  { value: "WINE", label: "Vinho" },
] as const;

export const colorModeOptions = [
  { value: "SYSTEM", label: "Usar configuração do sistema" },
  { value: "LIGHT", label: "Claro" },
  { value: "DARK", label: "Escuro" },
] as const;

export const fontFamilyOptions = [
  { value: "INTER", label: "Inter" },
  { value: "SOURCE_SANS", label: "Source Sans 3" },
  { value: "ATKINSON", label: "Atkinson Hyperlegible" },
] as const;

export const fontScaleOptions = [
  { value: "1", label: "100% — Padrão" },
  { value: "1.15", label: "115% — Confortável" },
  { value: "1.3", label: "130% — Ampliada" },
] as const;

export const shiftOptions = [
  { value: "", label: "Não informado" },
  { value: "Matutino", label: "Matutino" },
  { value: "Vespertino", label: "Vespertino" },
  { value: "Noturno", label: "Noturno" },
  { value: "Integral", label: "Integral" },
] as const;
