import { fileTypeFromBuffer } from "file-type";
import * as fs from "fs";
import * as path from "path";

async function getFileTypeFromBuffer(buffer: Buffer) {
  const result = await fileTypeFromBuffer(buffer);
  if (result) {
    return result.ext;
  } else {
    return "unknown";
  }
}
export { getFileTypeFromBuffer };

async function uploadFile(
  file: Buffer,
  fileName: string,
  testId: string,
  oldFileName: string = ""
) {
  try {
    const uploadDir = `${process.env.NEXT_PUBLIC_UPLOAD_FILE_PATH}/${testId}`; // Directorio donde se guardarán los archivos
    const uploadPath = path.join(uploadDir, fileName); // Ruta de destino para guardar el archivo

    if (oldFileName && oldFileName !== "") {
      const deletePath = path.join(uploadDir, oldFileName);
      await fs.promises.unlink(deletePath);
    }

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
    if (fileName === "") await fs.promises.rm(filePath, { recursive: true });
    else await fs.promises.unlink(deletePath);

    return "Archivo eliminado correctamente";
  } catch (error) {
    return false;
  }
}

export { uploadFile, deleteFile };
