import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request, { params }: any) {
  const data = await req.formData();

  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const uploadDir = "./public/uploads"; // Directorio donde se guardarán las imágenes
    const uploadPath = path.join(uploadDir, file.name); // Ruta de destino para guardar la imagen

    // Verificar si el directorio de carga existe, si no, crearlo
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileStream = fs.createWriteStream(uploadPath);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fileStream.write(buffer);
    fileStream.end();

    return NextResponse.json(
      { message: "Archivo cargado con éxito", imagePath: uploadPath },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al cargar el archivo:", error);
    return NextResponse.json(
      { error: "Error al cargar el archivo" },
      { status: 500 }
    );
  }
}
