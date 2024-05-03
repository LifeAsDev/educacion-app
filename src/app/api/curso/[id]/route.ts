import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Curso from "@/schemas/curso";

export async function DELETE(req: Request, { params }: any) {
  const id = params.id;

  await connectMongoDB();

  const deleteCurso = await Curso.findByIdAndDelete(id);

  if (deleteCurso)
    return NextResponse.json(
      { message: "Curso deleted successfully", curso: deleteCurso },
      { status: 200 }
    );
  else return NextResponse.json({ error: "Curso not found" }, { status: 404 });
}

export async function PATCH(req: Request, { params }: any) {
  try {
    const { id } = params;
    const { name } = await req.json();

    await connectMongoDB();

    // Buscar el curso por su ID
    const curso = await Curso.findByIdAndUpdate(id, { name }, { new: true });

    if (curso) {
      return NextResponse.json(
        { message: "Curso actualizado exitosamente", curso },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el curso", details: error },
      { status: 500 }
    );
  }
}
