import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/schemas/user";

function generateRandomPassword(length: number = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

async function generateUniqueDNI(): Promise<string> {
  let dni: string = "";
  let isUnique = false;

  while (!isUnique) {
    dni = `admin${Math.floor(Math.random() * 1000000)}`;
    const existingUser = await User.findOne({ dni });

    if (!existingUser) {
      isUnique = true;
    }
  }

  return dni;
}

export async function GET(req: Request) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Comparar el secret con NEXTAUTH_SECRET
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 403 });
  }

  // Generar una contraseña y DNI únicos
  const password = generateRandomPassword();
  const dni = await generateUniqueDNI();

  // Crear un nuevo administrador con la contraseña y DNI generados
  const admin = await User.create({
    nombre: "Admin",
    apellido: "User",
    password: password,
    rol: "Admin",
    dni: dni,
  });

  // Retornar un mensaje indicando que se ha creado el administrador
  return NextResponse.json(
    { message: "Admin created", RUT: dni, password },
    { status: 201 }
  );
}
