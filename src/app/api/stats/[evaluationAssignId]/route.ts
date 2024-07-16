import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import EvaluationTest from "@/schemas/evaluationTest";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationResult from "@/models/evaluationResult";
import User from "@/schemas/user";
import Curso from "@/schemas/curso";
import EvaluationOnCourseModel from "@/models/evaluationOnCourse";
import UserResult from "@/models/userResult";
import getEvaluationsOnCourse from "@/lib/userStatsFunction";
import UserModel from "@/models/user";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);
  const curso = searchParams.get("curso");
  const evaluationAssignId = params.evaluationAssignId;

  await connectMongoDB();
  const users = await User.find({ "curso.0": curso });

  await User.populate(users, {
    path: "curso",
    model: Curso,
  });
  const newUsersResults: UserResult[] = [];
  let generalScore = 0;

  for (const user of users) {
    const evaluationOnCourse = await EvaluationOnCourse.find({
      estudianteId: user._id,
      evaluationAssignId,
    });
    if (evaluationOnCourse) {
      const results = await getEvaluationsOnCourse(
        user._id,
        evaluationOnCourse
      );
      const newUserResult = { user: user as UserModel, results };
      generalScore += results.mainPercentage;

      newUsersResults.push(newUserResult);
    }
  }
  generalScore = Math.round(generalScore / newUsersResults.length) || 0;

  return NextResponse.json(
    {
      message: "Not found evaluationsOnCourse",
    },
    { status: 404 }
  );
}
