import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ConectaCETEP",
    short_name: "ConectaCETEP",
    description:
      "Informação, aprendizado e acolhimento para a comunidade CETEP.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8fb",
    theme_color: "#153f85",
    lang: "pt-BR",
    icons: [
      {
        src: "/brand/conectacetep-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
