const blockedAdultDomains = [
  "pornhub",
  "xvideos",
  "xnxx",
  "xhamster",
  "redtube",
  "youporn",
  "spankbang",
  "brazzers",
  "onlyfans",
  "chaturbate",
  "stripchat",
];

const explicitTerms = [
  "pornografia",
  "pornografico",
  "porno",
  "hentai",
  "nudes",
  "nudez explicita",
  "sexo explicito",
  "video de sexo",
  "videos de sexo",
  "conteudo adulto",
];

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z0-9.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsBlockedDomain(value: string) {
  const compact = normalize(value).replace(/\s+/g, "");
  return blockedAdultDomains.some((domain) =>
    compact.includes(domain.replace(/\s+/g, "")),
  );
}

function containsExplicitTerm(value: string) {
  const normalized = ` ${normalize(value)} `;
  return explicitTerms.some((term) => normalized.includes(` ${term} `));
}

export function validateCommunityContent(...values: Array<string | null | undefined>) {
  const value = values.filter(Boolean).join(" \n ");
  if (containsBlockedDomain(value)) {
    return "Links e referências a sites adultos não são permitidos.";
  }
  if (containsExplicitTerm(value)) {
    return "Remova o conteúdo sexualmente explícito antes de publicar.";
  }
  return null;
}
