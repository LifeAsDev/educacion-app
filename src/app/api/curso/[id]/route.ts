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
