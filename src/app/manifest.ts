import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ConectaARCA",
    short_name: "ConectaARCA",
    description:
      "Informação, aprendizado e acolhimento para a comunidade escolar.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8fb",
    theme_color: "#153f85",
    lang: "pt-BR",
    icons: [
      {
        src: "/brand/arca-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
