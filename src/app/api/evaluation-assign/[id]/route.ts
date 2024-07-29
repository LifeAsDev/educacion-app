import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationAssign from "@/schemas/evaluationAssign";

export async function DELETE(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const id = params.id;
  try {
    await connectMongoDB();
    const evaluationAssign = await EvaluationAssign.findByIdAndDelete(id);

    if (!evaluationAssign) {
      return NextResponse.json(
        { ok: false, message: "Evaluation assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "Evaluation assignment deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while deleting the evaluation assignment",
        error: error,
      },
      { status: 500 }
    );
  }
}
