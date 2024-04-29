import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/schemas/user";

export async function GET(req: Request) {
  await connectMongoDB();

  // Verificar si ya existe un usuario con el nombre de usuario "admin"
  const existingAdmin = await User.findOne({ dni: "admin" });

  if (existingAdmin) {
    // Si ya existe un usuario con ese nombre de usuario, retornar un mensaje indicando que ya está activado
    return NextResponse.json(
      { message: "Admin already activated" },
      { status: 200 }
    );
  } else {
    // Si no existe un usuario con ese nombre de usuario, crear el usuario "admin"
    const admin = await User.create({
      nombre: "admin",
      apellido: "admin",
      password: "admin",
      rol: "Admin",
      dni: "admin",
    });

    // Retornar un mensaje indicando que se ha activado el administrador
    return NextResponse.json({ message: "Admin activated" }, { status: 200 });
  }
}
