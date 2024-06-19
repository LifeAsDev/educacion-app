import User from "@/schemas/user";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";

export async function PATCH(req: Request, { params }: any) {
  const estudianteId = params.id;
  const evaluationAssignId = params.evaluationAssignId;

  await connectMongoDB();
  const evaluationOnCourse = await EvaluationOnCourse.findOne({
    evaluationAssignId,
    estudianteId,
  });

  if (evaluationOnCourse) {
    const currentTime = new Date();

    evaluationOnCourse.state = "Completada";
    evaluationOnCourse.endTime = currentTime;
    if (!evaluationOnCourse.startTime) {
      evaluationOnCourse.startTime = currentTime;
    }
    await evaluationOnCourse.save();

    return NextResponse.json(
      { message: "User updated", evaluationOnCourse },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { error: "User not found or failed to update" },
      { status: 404 }
    );
  }
}
