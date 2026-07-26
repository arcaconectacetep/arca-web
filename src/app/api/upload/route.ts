import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ImgChestUploadError,
  uploadImageToImgChest,
} from "@/services/imgchest";
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { data: profile } = await supabase
    .from("profiles")
    .select("suspended_at")
    .eq("id", user.id)
    .single();
  if (!profile || profile.suspended_at)
    return NextResponse.json(
      { error: "Acesso não autorizado." },
      { status: 403 },
    );
  try {
    const data = await request.formData();
    const file = data.get("file");
    const kind = data.get("kind");
    if (kind !== "avatar" && kind !== "post")
      return NextResponse.json(
        { error: "Tipo de upload inválido." },
        { status: 400 },
      );
    if (!(file instanceof File))
      return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
    const result = await uploadImageToImgChest(file, 4 * 1024 * 1024);
    if (kind === "avatar") {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: result.imageUrl })
        .eq("id", user.id);
      if (error)
        return NextResponse.json(
          {
            error:
              "A imagem foi enviada, mas não foi possível atualizar o perfil.",
          },
          { status: 500 },
        );
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha no upload." },
      { status: error instanceof ImgChestUploadError ? error.status : 500 },
    );
  }
}
