export const roleLabels: Record<string, string> = {
  STUDENT: "Estudante",
  TEACHER: "Professor(a)",
  STAFF: "Equipe gestora",
  ADMIN: "Administrador(a)",
};

export const alertStatusLabels: Record<string, string> = {
  RECEIVED: "Recebida",
  UNDER_REVIEW: "Em análise",
  CONTACT_ATTEMPTED: "Contato tentado",
  FORWARDED: "Encaminhada",
  RESOLVED: "Resolvida",
  ARCHIVED: "Arquivada",
};

export const alertUrgencyLabels: Record<string, string> = {
  GUIDANCE: "Orientação",
  ATTENTION: "Atenção",
  URGENT: "Urgente",
};

export const alertCategoryLabels: Record<string, string> = {
  BULLYING: "Bullying",
  CYBERBULLYING: "Cyberbullying",
  PREJUDICE: "Preconceito",
  DISCRIMINATION: "Discriminação",
  HARASSMENT: "Assédio",
  THREAT: "Ameaça",
  ACCESSIBILITY: "Acessibilidade",
  EMOTIONAL_SUPPORT: "Sofrimento emocional",
  OTHER: "Outra situação escolar",
};

export const postSectionLabels: Record<string, string> = {
  FEED: "Feed escolar",
  PEDAGOGICAL: "Espaço pedagógico",
  WALL: "Mural",
  TRENDS: "Tendências",
};

export const postTypeLabels: Record<string, string> = {
  GENERAL: "Geral",
  ANNOUNCEMENT: "Comunicado",
  PEDAGOGICAL: "Pedagógico",
  HEALTH: "Saúde",
  SAFETY: "Segurança",
  OPPORTUNITY: "Oportunidade",
  CULTURE: "Cultura",
  ENTREPRENEURSHIP: "Empreendedorismo",
};

export const auditActionLabels: Record<string, string> = {
  USER_ROLE_UPDATED: "Papel de usuário alterado",
  USER_SUSPENDED: "Usuário suspenso",
  USER_RESTORED: "Usuário reativado",
  USER_DELETED: "Usuário excluído",
  ACCOUNT_SELF_DELETED: "Conta excluída pelo titular",
  POST_HIDDEN: "Publicação ocultada",
  POST_RESTORED: "Publicação restaurada",
  SUPPORT_STATUS_UPDATED: "Status de suporte atualizado",
};

export const auditResourceLabels: Record<string, string> = {
  profile: "Usuário",
  post: "Publicação",
  support_alert: "Solicitação de suporte",
};

export function labelFor(labels: Record<string, string>, value?: string | null) {
  return value ? (labels[value] ?? value.replaceAll("_", " ")) : "Não informado";
}
