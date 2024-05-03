import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Asignatura from "@/schemas/asignatura";

export async function DELETE(req: Request, { params }: any) {
  const id = params.id;

  try {
    await connectMongoDB();

    const deleteAsignatura = await Asignatura.findByIdAndDelete(id);

    if (deleteAsignatura) {
      return NextResponse.json(
        {
          message: "Asignatura deleted successfully",
          asignatura: deleteAsignatura,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Asignatura not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar la asignatura", details: error },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: any) {
  try {
    const { id } = params;
    const { name } = await req.json();

    await connectMongoDB();

    // Buscar la asignatura por su ID y actualizarla
    const asignatura = await Asignatura.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (asignatura) {
      return NextResponse.json(
        { message: "Asignatura updated successfully", asignatura },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Asignatura not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar la asignatura", details: error },
      { status: 500 }
    );
  }
}
