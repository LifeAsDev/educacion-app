import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";

export async function PATCH(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);
  const userId = params.id;
  const formData = await req.formData();
  const curso = JSON.parse(formData.get("curso") as string); // array of strings;
  const nombre = formData.get("nombre");
  const apellido = formData.get("apellido");
  const rol = formData.get("rol");
  const rut = formData.get("rut");
  const actualPass = formData.get("actualPass");
  let newPass = formData.get("newPass");
  const asignatura: string | undefined = formData.get("asignatura") as string;

  await connectMongoDB();

  const userPassword = await User.findById(userId).select("password");
  if (actualPass !== null && userPassword.password !== actualPass) {
    return NextResponse.json({ error: "Clave Actual" }, { status: 401 });
  }
  if (actualPass === null) newPass = userPassword.password;

  const patchedUser = await User.findByIdAndUpdate(userId, {
    nombre,
    apellido,
    rol,
    dni: rut,
    curso,
    review: false,
    password: newPass,
    asignatura: asignatura ? asignatura : undefined,
  });

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
