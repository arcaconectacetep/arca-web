const TRANSPORT_LIMIT = 4 * 1024 * 1024;

export async function prepareImageForUpload(
  file: File,
  maxDimension = 2200,
): Promise<File> {
  if (file.size <= TRANSPORT_LIMIT) return file;

  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
  canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Não foi possível preparar a imagem.");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  for (const quality of [0.86, 0.74, 0.62, 0.5]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    if (blob && blob.size <= TRANSPORT_LIMIT) {
      const name = file.name.replace(/\.[^.]+$/, "") || "imagem";
      return new File([blob], `${name}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });
    }
  }

  throw new Error(
    "Não foi possível reduzir a imagem. Escolha um arquivo menor.",
  );
}
