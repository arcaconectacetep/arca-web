"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { differenceInCalendarDays, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpRight,
  Bell,
  CheckCheck,
  ChevronRight,
  Heart,
  LifeBuoy,
  Megaphone,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Tabs } from "radix-ui";
import { toast } from "sonner";
import { markNotificationAsRead } from "@/app/actions";
import { Avatar } from "@/components/ui/avatar";

export type ActivityNotification = {
  id: string;
  type: "COMMENT" | "LIKE" | "ANNOUNCEMENT" | "SUPPORT_UPDATE" | "ADMIN";
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
  actor_id?: string | null;
  post_id?: string | null;
  comment_id?: string | null;
  actor?: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  post?: {
    title: string | null;
    content: string;
  } | null;
};

const groupOrder = ["Hoje", "Nos últimos 7 dias", "Anteriores"] as const;

function groupFor(date: string) {
  const difference = differenceInCalendarDays(new Date(), new Date(date));
  if (difference <= 0) return "Hoje";
  if (difference <= 7) return "Nos últimos 7 dias";
  return "Anteriores";
}

function presentation(notification: ActivityNotification) {
  const actorName =
    notification.actor?.full_name?.trim() ||
    (notification.actor?.username
      ? `@${notification.actor.username}`
      : "Alguém");

  switch (notification.type) {
    case "LIKE":
      return {
        actorName,
        action: "curtiu sua publicação",
        label: null,
        icon: Heart,
        tone: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
      };
    case "COMMENT":
      return {
        actorName,
        action: "comentou na sua publicação",
        label: null,
        icon: MessageCircle,
        tone: "bg-brand-soft text-brand",
      };
    case "ANNOUNCEMENT":
      return {
        actorName: null,
        action: null,
        label: notification.title,
        icon: Megaphone,
        tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      };
    case "SUPPORT_UPDATE":
      return {
        actorName: null,
        action: null,
        label: notification.title,
        icon: LifeBuoy,
        tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      };
    default:
      return {
        actorName: null,
        action: null,
        label: notification.title,
        icon: ShieldCheck,
        tone: "bg-brand-soft text-brand",
      };
  }
}

function destinationFor(notification: ActivityNotification) {
  if (notification.type === "COMMENT" && notification.post_id) {
    const anchor = notification.comment_id
      ? `#comentario-${notification.comment_id}`
      : "#comentarios";
    return `/publicacao/${notification.post_id}${anchor}`;
  }
  if (notification.type === "LIKE" && notification.post_id) {
    return `/publicacao/${notification.post_id}`;
  }
  return notification.href || "/notificacoes";
}

function destinationLabel(notification: ActivityNotification) {
  if (notification.type === "COMMENT") return "Abrir comentário";
  if (notification.type === "LIKE") return "Abrir publicação";
  if (notification.type === "SUPPORT_UPDATE") return "Ver solicitação";
  if (notification.type === "ADMIN") return "Abrir painel";
  return "Ver detalhes";
}

function postContext(notification: ActivityNotification) {
  return notification.post?.title?.trim() || notification.post?.content?.trim();
}

function NotificationAvatar({ notification }: { notification: ActivityNotification }) {
  const { icon: Icon, tone } = presentation(notification);
  const social = ["LIKE", "COMMENT"].includes(notification.type);

  return (
    <span className="relative z-10 shrink-0">
      {social && notification.actor ? (
        <Avatar
          url={notification.actor.avatar_url}
          name={notification.actor.full_name || notification.actor.username}
          size={52}
        />
      ) : (
        <span className={`grid size-[52px] place-items-center rounded-full ${tone}`}>
          <Icon className="size-5" aria-hidden />
        </span>
      )}
      {social && notification.actor && (
        <span
          className={`absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-paper ${tone}`}
        >
          <Icon className="size-3" aria-hidden />
        </span>
      )}
    </span>
  );
}

export function NotificationCenter({
  notifications,
}: {
  notifications: ActivityNotification[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [readIds, setReadIds] = useState(
    () => new Set(notifications.filter((item) => item.read_at).map((item) => item.id)),
  );
  const [pending, startTransition] = useTransition();
  const unreadCount = notifications.filter((item) => !readIds.has(item.id)).length;
  const visible = useMemo(
    () =>
      filter === "unread"
        ? notifications.filter((item) => !readIds.has(item.id))
        : notifications,
    [filter, notifications, readIds],
  );
  const groups = groupOrder.map((label) => ({
    label,
    items: visible.filter((item) => groupFor(item.created_at) === label),
  }));

  function markAll() {
    const previous = readIds;
    setReadIds(new Set(notifications.map((item) => item.id)));
    startTransition(async () => {
      const result = await markNotificationAsRead();
      if (!result.ok) {
        setReadIds(previous);
        toast.error(result.error);
        return;
      }
      toast.success("Todas as notificações foram marcadas como lidas.");
      router.refresh();
    });
  }

  function openUnread(
    event: React.MouseEvent<HTMLAnchorElement>,
    notification: ActivityNotification,
  ) {
    if (readIds.has(notification.id)) return;
    event.preventDefault();
    const href = destinationFor(notification);
    setReadIds((current) => new Set(current).add(notification.id));
    startTransition(async () => {
      const result = await markNotificationAsRead(notification.id);
      if (!result.ok) toast.error(result.error);
      router.push(href);
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Sua atividade</p>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="page-title">Notificações</h1>
            {unreadCount > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand"
              >
                {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
              </motion.span>
            )}
          </div>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Acompanhe conversas, reações e atualizações importantes em um só lugar.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary shrink-0"
          onClick={markAll}
          disabled={pending || unreadCount === 0}
        >
          <CheckCheck className="size-4" aria-hidden />
          Marcar tudo como lido
        </button>
      </div>

      <Tabs.Root
        value={filter}
        onValueChange={(value) => setFilter(value as "all" | "unread")}
        className="mt-7"
      >
        <Tabs.List
          aria-label="Filtrar notificações"
          className="inline-flex rounded-xl border border-line/80 bg-paper p-1 shadow-sm"
        >
          <Tabs.Trigger
            value="all"
            className="min-h-10 rounded-lg px-4 text-sm font-semibold text-muted transition-colors data-[state=active]:bg-brand-soft data-[state=active]:text-brand"
          >
            Todas
          </Tabs.Trigger>
          <Tabs.Trigger
            value="unread"
            className="flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-muted transition-colors data-[state=active]:bg-brand-soft data-[state=active]:text-brand"
          >
            Não lidas
            {unreadCount > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] leading-5 text-white">
                {unreadCount}
              </span>
            )}
          </Tabs.Trigger>
        </Tabs.List>

        <div className="mt-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.length === 0 ? (
              <motion.div
                key={`empty-${filter}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="card px-6 py-14 text-center"
              >
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-soft text-brand">
                  <Bell className="size-6" aria-hidden />
                </span>
                <h2 className="mt-4 text-base font-bold">
                  {filter === "unread" ? "Tudo em dia" : "Nenhuma atividade ainda"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {filter === "unread"
                    ? "Você já viu todas as notificações."
                    : "Curtidas, comentários e avisos aparecerão aqui."}
                </p>
              </motion.div>
            ) : (
              groups.map(
                (group) =>
                  group.items.length > 0 && (
                    <motion.section
                      layout
                      key={group.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mb-7"
                    >
                      <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                        {group.label}
                      </h2>
                      <div className="overflow-hidden rounded-2xl border border-line/70 bg-paper shadow-[0_12px_35px_-30px_hsl(var(--ink)/.45)]">
                        {group.items.map((notification, index) => {
                          const isRead = readIds.has(notification.id);
                          const view = presentation(notification);
                          const context = postContext(notification);
                          const social = ["LIKE", "COMMENT"].includes(
                            notification.type,
                          );
                          const destination = destinationFor(notification);
                          return (
                            <motion.div
                              layout
                              key={notification.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(index * 0.035, 0.18) }}
                              className="relative"
                            >
                              {index < group.items.length - 1 && (
                                <span
                                  aria-hidden
                                  className="absolute bottom-0 left-[26px] top-[62px] w-px bg-line"
                                />
                              )}
                              <Link
                                href={destination}
                                onClick={(event) => openUnread(event, notification)}
                                aria-label={`${view.actorName ? `${view.actorName} ${view.action}` : view.label}. ${destinationLabel(notification)}`}
                                className={`group relative flex min-h-[104px] gap-4 border-b border-line/60 p-4 transition-colors last:border-b-0 hover:bg-brand-soft/35 sm:p-5 ${
                                  isRead ? "" : "bg-brand-soft/20"
                                }`}
                              >
                                <NotificationAvatar notification={notification} />
                                <span className="min-w-0 flex-1 self-center">
                                  <span className="flex items-start gap-2">
                                    <span className="min-w-0 flex-1 text-[15px] leading-5 text-ink/85">
                                      {view.actorName ? (
                                        <>
                                          <strong className="font-extrabold text-ink">
                                            {view.actorName}
                                          </strong>{" "}
                                          <span
                                            className={
                                              isRead ? "" : "font-semibold text-ink"
                                            }
                                          >
                                            {view.action}
                                          </span>
                                        </>
                                      ) : (
                                        <strong
                                          className={
                                            isRead ? "font-semibold" : "font-bold"
                                          }
                                        >
                                          {view.label}
                                        </strong>
                                      )}
                                    </span>
                                    {!isRead && (
                                      <span
                                        className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                                        aria-label="Não lida"
                                      />
                                    )}
                                  </span>
                                  {social ? (
                                    <span className="mt-2 block rounded-xl bg-canvas/80 px-3 py-2 text-sm leading-5 text-muted ring-1 ring-line/50 transition-colors group-hover:bg-paper/80">
                                      {notification.type === "COMMENT" ? (
                                        <span className="line-clamp-2">
                                          “{notification.body || "Comentário indisponível."}”
                                        </span>
                                      ) : context ? (
                                        <span className="line-clamp-1">
                                          Em{" "}
                                          <strong className="font-semibold text-ink/75">
                                            {context}
                                          </strong>
                                        </span>
                                      ) : (
                                        <span>{notification.body}</span>
                                      )}
                                    </span>
                                  ) : notification.body ? (
                                    <span className="mt-1 line-clamp-2 block text-sm leading-5 text-muted">
                                      {notification.body}
                                    </span>
                                  ) : null}
                                  <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <time
                                      dateTime={notification.created_at}
                                      className="text-xs font-medium text-muted"
                                    >
                                      {formatDistanceToNow(
                                        new Date(notification.created_at),
                                        {
                                          addSuffix: true,
                                          locale: ptBR,
                                        },
                                      )}
                                    </time>
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-brand opacity-75 transition-opacity group-hover:opacity-100">
                                      {destinationLabel(notification)}
                                      <ArrowUpRight className="size-3.5" aria-hidden />
                                    </span>
                                  </span>
                                </span>
                                <ChevronRight
                                  className="mt-4 hidden size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 sm:block"
                                  aria-hidden
                                />
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.section>
                  ),
              )
            )}
          </AnimatePresence>
        </div>
      </Tabs.Root>
    </div>
  );
}
