import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationTest from "@/schemas/evaluationTest";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const id = params.id;
  const userId = searchParams.get("userId");
  console.log("Id ", userId);
  try {
    await connectMongoDB();
    const evaluationCreatorId = await EvaluationTest.findById(id);
    if (!evaluationCreatorId) {
      return NextResponse.json(
        { ok: false, message: "unauthorized" },
        { status: 400 }
      );
    }
    console.log("Id ", evaluationCreatorId.creatorId.toString());

    if (evaluationCreatorId.creatorId.toString() !== userId) {
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
