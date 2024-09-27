import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const photoName = searchParams.get("photoName");
  let type = searchParams.get("type");
  const returnWithLink = searchParams.get("link") === "true";
  const filePath = path.join(
    `${process.env.NEXT_PUBLIC_UPLOAD_FILE_PATH}`,
    photoName as string
  ); // Ruta del archivo solicitado
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "El archivo no existe" },
        { status: 404 }
      );
    }

    // Leer el contenido del archivo como un Buffer
    const fileBuffer = fs.readFileSync(filePath);

    const headers = new Headers();
    if (!type && photoName) {
      const ext = path.extname(photoName).toLowerCase();
      type = ext;
    }

    headers.set("Content-Type", type!);

    const blob = new Blob([fileBuffer as Buffer]);
    const fileGet = URL.createObjectURL(blob);

    // or just use new Response ❗️
    return new NextResponse(blob, {
      status: 200,
      statusText: "OK",
      headers,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error getting the file" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const photoName = searchParams.get("photoName");
  try {
    const filePath = path.join(
      `${process.env.NEXT_PUBLIC_UPLOAD_FILE_PATH}`,
      photoName as string
    ); // Ruta del archivo solicitado

    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "El archivo no existe" },
        { status: 404 }
      );
    }

    // Borrar el archivo
    fs.unlinkSync(filePath);

    return NextResponse.json({ message: "Archivo eliminado correctamente" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error deleting the file" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
