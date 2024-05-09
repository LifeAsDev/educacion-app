import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationTest from "@/schemas/evaluationTest";

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

export async function GET(req: Request, { params }: any) {
  const id = params.id;

  try {
    await connectMongoDB();
    const evaluationTest = await EvaluationTest.findById(id);
    if (!evaluationTest) {
      return NextResponse.json(
        { message: "EvaluationTest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ evaluationTest }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      error: error,
    });
  }
}
