import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import User from "@/schemas/user";

export async function GET(req: Request) {
  await connectMongoDB();
  const admin = await User.create({
    name: "admin",
    apellido: "admin",
    password: "admin",
    rol: "Admin",
    dni: "admin",
  });
  if (admin)
    return NextResponse.json({ message: "Admin activated" }, { status: 200 });
}
