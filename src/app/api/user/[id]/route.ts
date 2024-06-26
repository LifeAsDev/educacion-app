import User from "@/schemas/user";
import Curso from "@/schemas/curso";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Types } from "mongoose";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);
  const userId = params.id;

  await connectMongoDB();

  const getUser = await User.findById(userId).select("-password");
  const populated = await getUser.populate({ path: "curso", model: Curso });
  if (getUser) {
    return NextResponse.json(
      { message: "User found", user: getUser },
      { status: 200 }
    );
  } else return NextResponse.json({ error: "User not found" }, { status: 404 });
}

export async function DELETE(req: Request, { params }: any) {
  const userId = params.id;

  await connectMongoDB();

  const deleteUser = await User.findByIdAndDelete(userId).select("-password");

  if (deleteUser)
    return NextResponse.json(
      { message: "User deleted successfully", user: deleteUser },
      { status: 200 }
    );
  else return NextResponse.json({ error: "User not found" }, { status: 404 });
}

export async function PATCH(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);
  const userId = params.id;
  const formData = await req.formData();
  const curso = JSON.parse(formData.get("curso") as string); // array of strings;
  const nombre = formData.get("nombre");
  const apellido = formData.get("apellido");
  const rol = formData.get("rol");
  const rut = formData.get("rut");
  const password = formData.get("password");
  const asignatura: string | undefined = formData.get("asignatura") as string;

  await connectMongoDB();

  const patchedUser = await User.findByIdAndUpdate(
    userId,
    {
      nombre,
      apellido,
      rol,
      dni: rut,
      curso,
      review: false,
      password,
      asignatura: asignatura ? asignatura : null,
    },
    { new: true }
  );

  if (patchedUser) {
    return NextResponse.json(
      { message: "User updated", user: patchedUser },
      { status: 200 }
    );
  } else
    return NextResponse.json(
      { error: "User not found or failed to update" },
      { status: 404 }
    );
}
