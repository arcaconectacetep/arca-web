import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/cadastro", "/termos", "/privacidade"],
      disallow: [
        "/admin/",
        "/inicio",
        "/suporte/",
        "/notificacoes",
        "/configuracoes",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
