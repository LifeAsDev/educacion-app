import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function POST(req: Request, { params }: any) {
  const data = await req.formData();

  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const uploadDir = `${process.env.NEXT_PUBLIC_UPLOAD_FILE_PATH}`; // Directorio donde se guardarán las imágenes
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

async function uploadFile(file: Buffer, fileName: string, testId: string) {
  try {
    const uploadDir = `${process.env.NEXT_PUBLIC_UPLOAD_FILE_PATH}/${testId}`; // Directorio donde se guardarán los archivos
    const uploadPath = path.join(uploadDir, fileName); // Ruta de destino para guardar el archivo

    // Verificar si el directorio de carga existe, si no, crearlo
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileStream = fs.createWriteStream(uploadPath);

    fileStream.write(file);
    fileStream.end();
    const getImagePath = `${testId}/${fileName}`;
    return {
      success: true,
      message: "Archivo cargado con éxito",
      imagePath: getImagePath,
    };
  } catch (error) {
    console.error("Error al cargar el archivo:", error);
    return {
      success: false,
      error: "Error al cargar el archivo",
    };
  }
}

async function deleteFile(pathName: string, fileName: string = "") {
  const filePath = path.join(
    `${process.env.NEXT_PUBLIC_UPLOAD_FILE_PATH}`,
    pathName
  );
  const deletePath = path.join(filePath, fileName);
  try {
    // Verificar si el archivo existe
    await fs.promises.access(deletePath, fs.constants.F_OK);
  } catch (error) {
    return "Archivo ya eliminado";
  }

  try {
    // Borrar el archivo
    if (fileName === "") await fs.promises.rmdir(filePath, { recursive: true });
    else await fs.promises.unlink(deletePath);

    return "Archivo eliminado correctamente";
  } catch (error) {
    return false;
  }
}

export { uploadFile, deleteFile };
