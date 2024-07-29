import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";

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

    await EvaluationOnCourse.deleteMany({ evaluationAssignId: id });

    return NextResponse.json(
      {
        ok: true,
        message:
          "Evaluation assignment and associated evaluations deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message:
          "An error occurred while deleting the evaluation assignment and associated evaluations",
        error: error,
      },
      { status: 500 }
    );
  }
}
