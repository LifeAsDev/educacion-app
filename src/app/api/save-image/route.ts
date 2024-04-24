import { NextResponse } from "next/server";
import multer from "multer";

export async function POST(req: Request, { params }: any) {
  const data = await req.formData();

  const file: File | null = data.get("file") as unknown as File;
  console.log(file.name);

  if (false) {
    return NextResponse.json(
      { message: "Invalid ObjectId format" },
      { status: 400 }
    );
  }

  if (true) return NextResponse.json({}, { status: 200 });
  else return NextResponse.json({ message: "event no exist" }, { status: 500 });
}
