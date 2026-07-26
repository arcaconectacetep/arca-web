import "server-only";
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
type ImgChestResponse = {
  data?: { images?: Array<{ id: string; link: string; thumbnail?: string }> };
};

type ImgChestErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export class ImgChestUploadError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ImgChestUploadError";
  }
}

export async function uploadImageToImgChest(
  file: File,
  maxBytes = 10 * 1024 * 1024,
): Promise<{ imageUrl: string; thumbnailUrl?: string; imageId?: string }> {
  if (!ALLOWED.has(file.type))
    throw new ImgChestUploadError("Formato de imagem não permitido.", 415);
  if (file.size <= 0 || file.size > maxBytes)
    throw new ImgChestUploadError("A imagem excede o tamanho permitido.", 413);
  const key = process.env.IMG_CHEST_API_KEY;
  if (!key)
    throw new ImgChestUploadError("Upload de imagens não configurado.", 503);
  const body = new FormData();
  body.append("images[]", file, file.name);
  body.append("privacy", "hidden");
  const response = await fetch("https://api.imgchest.com/v1/post", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    body,
    cache: "no-store",
  });
  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => null)) as ImgChestErrorResponse | null;
    const imageRejected = Boolean(
      errorBody?.errors?.["images"] || errorBody?.errors?.["images.0"],
    );
    throw new ImgChestUploadError(
      response.status === 429
        ? "Muitos uploads. Tente novamente em instantes."
        : response.status === 401 || response.status === 403
          ? "O serviço de imagens recusou a credencial configurada."
          : imageRejected
            ? "O ImgChest rejeitou este arquivo. Tente outra imagem JPEG, PNG ou WebP."
            : "O ImgChest não conseguiu processar a imagem.",
      response.status === 429 ? 429 : response.status < 500 ? 400 : 502,
    );
  }
  const json = (await response.json()) as ImgChestResponse;
  const image = json.data?.images?.[0];
  if (!image?.link || !image.link.startsWith("https://cdn.imgchest.com/files/"))
    throw new ImgChestUploadError(
      "Resposta inválida do serviço de imagens.",
      502,
    );
  return {
    imageUrl: image.link,
    thumbnailUrl: image.thumbnail,
    imageId: image.id,
  };
}
