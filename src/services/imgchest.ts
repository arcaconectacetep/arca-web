import "server-only";
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
type ImgChestResponse = {
  data?: { images?: Array<{ id: string; link: string; thumbnail?: string }> };
};
export async function uploadImageToImgChest(
  file: File,
  maxBytes = 10 * 1024 * 1024,
): Promise<{ imageUrl: string; thumbnailUrl?: string; imageId?: string }> {
  if (!ALLOWED.has(file.type))
    throw new Error("Formato de imagem não permitido.");
  if (file.size <= 0 || file.size > maxBytes)
    throw new Error("A imagem excede o tamanho permitido.");
  const key = process.env.IMG_CHEST_API_KEY;
  if (!key) throw new Error("Upload de imagens não configurado.");
  const body = new FormData();
  body.append("images[]", file, file.name);
  body.append("privacy", "hidden");
  body.append("anonymous", "false");
  const response = await fetch("https://api.imgchest.com/v1/post", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    body,
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      response.status === 429
        ? "Muitos uploads. Tente novamente em instantes."
        : "Não foi possível enviar a imagem.",
    );
  const json = (await response.json()) as ImgChestResponse;
  const image = json.data?.images?.[0];
  if (!image?.link || !image.link.startsWith("https://cdn.imgchest.com/files/"))
    throw new Error("Resposta inválida do serviço de imagens.");
  return {
    imageUrl: image.link,
    thumbnailUrl: image.thumbnail,
    imageId: image.id,
  };
}
