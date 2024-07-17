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
  const evaluationId = params.evaluationAssignId;

  await connectMongoDB();
  const users = await User.find({
    "curso.0": "664e08e61b92114795edcb40",
    rol: "Estudiante",
  });
  const evaluationAssign = await EvaluationAssign.findOne({
    evaluationId,
  })
    .sort({ createdAt: -1 })
    .populate({ path: "evaluationId", model: EvaluationTest });

  await User.populate(users, {
    path: "curso",
    model: Curso,
  });

  const newUsersResults: UserResult[] = [];
  let generalScore = 0;
  let userIndex = 0;
  let questionsLabel: string[] = [];
  let questionsCorrect: number[] = [];
  let estudiantesLogro: number[] = [0, 0, 0];
  for (const user of users) {
    const evaluationOnCourse: EvaluationOnCourseModel[] =
      await EvaluationOnCourse.find({
        estudianteId: user._id,
        evaluationAssignId: evaluationAssign._id,
      });

    if (evaluationOnCourse) {
      const results = await getEvaluationsOnCourse(
        user._id,
        evaluationOnCourse
      );
      const newUserResult = { user: user as UserModel, results };
      if (results.mainPercentage <= 49) {
        estudiantesLogro[2]++;
      } else if (results.mainPercentage <= 84) {
        estudiantesLogro[1]++;
      } else {
        estudiantesLogro[0]++;
      }
      generalScore += results.mainPercentage;

      newUsersResults.push(newUserResult);

      if (userIndex === 0 && !!results.evaluationList.length) {
        userIndex++;

        await EvaluationOnCourse.populate(evaluationOnCourse, {
          path: "evaluationAssignId",
          model: EvaluationAssign,
          populate: {
            path: "evaluationId",
            model: EvaluationTest,
          },
        });

        questionsLabel = evaluationAssign.evaluationId.questionArr.map(
          (question: { pregunta: string }) => question.pregunta
        );

        questionsCorrect = questionsLabel.map((question) => 0);
        for (let i = 0; i < questionsCorrect.length; i++) {
          questionsCorrect[i] += results.evaluationList[0].progress[i] ? 1 : 0;
        }
      }
    }
  }
  generalScore = Math.round(generalScore / newUsersResults.length) || 0;
  console.log({ estudiantesLogro });
  if (users.length > 0) {
    return NextResponse.json(
      {
        estudiantesLogro,
        questionsAciertos: {
          labels: questionsLabel,
          aciertos: questionsCorrect.map((acierto) => acierto),
        },
        message: "stats",
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      message: "Not found evaluationsOnCourse",
    },
    { status: 404 }
  );
}
