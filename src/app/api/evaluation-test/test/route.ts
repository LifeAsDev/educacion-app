import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import EvaluationTest from "@/schemas/evaluationTest";
import Question from "@/models/question";
import { uploadFile } from "@/lib/functionToFiles";
import { getFileTypeFromBuffer } from "@/lib/functionToFiles";
import mongoose, { Types } from "mongoose";
import Asignatura from "@/schemas/asignatura";
import User from "@/schemas/user";
import { FilePDF } from "@/models/evaluationTest";

export async function POST(req: Request) {
  console.log("check0");

  const data = await req.formData();
  console.log("check1", data);

  return NextResponse.json(
    {
      success: false,
      error: "error retrieving evaluation tests",
    },
    { status: 200 }
  );
}

export const dynamic = "force-dynamic";
