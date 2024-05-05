import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Curso from "@/schemas/curso";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const name: string = data.get("name") as string;

    await connectMongoDB();

    // Verificar si el curso ya existe
    const existingCurso = await Curso.findOne({ name });

    if (existingCurso) {
      return NextResponse.json(
        {
          id: existingCurso.id,
          message: "El curso ya existe",
        },
        { status: 200 }
      );
    }

    // Si el curso no existe, crearlo
    const newCurso = await Curso.create({ name });

    if (newCurso) {
      return NextResponse.json(
        {
          message: "Curso creado exitosamente",
          id: newCurso.id,
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
    const cursos = await Curso.find();
    return NextResponse.json({ cursos }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "error retrieving user",
    });
  }
}
