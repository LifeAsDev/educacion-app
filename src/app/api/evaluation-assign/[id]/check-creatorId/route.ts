import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationAssign from "@/schemas/evaluationAssign";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const id = params.id;
  const userId = searchParams.get("userId");
  try {
    await connectMongoDB();
    const evaluationCreatorId = await EvaluationAssign.findById(id);
    if (!evaluationCreatorId) {
      return NextResponse.json(
        { ok: false, message: "unauthorized" },
        { status: 400 }
      );
    }

    if (evaluationCreatorId.profesorId.toString() !== userId) {
      return NextResponse.json(
        { ok: false, message: "unauthorized" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "authorized" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      error: error,
    });
  }
}
