import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Asignatura from "@/schemas/asignatura";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const name: string = data.get("name") as string;

    await connectMongoDB();

    // Verificar si la asignatura ya existe
    const existingAsignatura = await Asignatura.findOne({ name });

    if (existingAsignatura) {
      return NextResponse.json(
        {
          id: existingAsignatura.id,
          error: "La asignatura ya existe",
        },
        { status: 200 }
      );
    }

    // Si la asignatura no existe, crearla
    const newAsignatura = await Asignatura.create({ name });

    if (newAsignatura) {
      return NextResponse.json(
        {
          message: "Asignatura creada exitosamente",
          id: newAsignatura.id,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error,
    });
  }
}

export async function GET(req: Request) {
  try {
    await connectMongoDB();
    const asignaturas = await Asignatura.find();
    return NextResponse.json({ asignaturas }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Error al recuperar las asignaturas",
    });
  }
}
