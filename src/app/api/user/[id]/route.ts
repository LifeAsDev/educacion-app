import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);
  const userId = params.id;
  const rol = searchParams.get("rol");

  await connectMongoDB();

  const getUser = await User.findById(userId).select("-password");

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
