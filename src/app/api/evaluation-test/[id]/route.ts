import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import EvaluationTest from "@/schemas/evaluationTest";
import Question from "@/models/question";

export async function DELETE(req: Request, { params }: any) {
  const id = params.id;

  try {
    await connectMongoDB();
    await EvaluationTest.deleteOne({ _id: id });
    return NextResponse.json(
      { message: "Delete successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "error deleting evaluation test",
    });
  }
}
