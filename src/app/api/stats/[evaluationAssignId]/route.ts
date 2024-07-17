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
import Asignatura from "@/schemas/asignatura";
import evaluationTest from "@/schemas/evaluationTest";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);
  const curso = searchParams.get("curso");
  const evaluationAssignId = params.evaluationAssignId;

  await connectMongoDB();

  const evaluationAssign = await EvaluationAssign.findById(
    evaluationAssignId
  ).populate([
    { path: "evaluationId", model: EvaluationTest },
    { path: "profesorId", model: User },
    { path: "curso", model: Curso },
    { path: "asignatura", model: Asignatura },
  ]);

  const evaluationsOnCourse: EvaluationOnCourseModel[] =
    await EvaluationOnCourse.find({
      evaluationAssignId: evaluationAssign._id,
    }).populate([{ path: "estudianteId", model: User }]);

  const newUsersResults: UserResult[] = [];
  let generalScore = 0;
  let userIndex = 0;
  let questionsLabel: string[] = [];
  let questionsCorrect: number[] = [];
  let estudiantesLogro: number[] = [0, 0, 0];
  for (const evaluationOnCourse of evaluationsOnCourse) {
    const results = await getEvaluationsOnCourse(
      evaluationOnCourse.estudianteId._id,
      [evaluationOnCourse],
      evaluationAssign.evaluationId
    );

    const newUserResult = {
      user: evaluationOnCourse.estudianteId as UserModel,
      results,
    };
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
  generalScore = Math.round(generalScore / newUsersResults.length) || 0;
  if (evaluationsOnCourse.length > 0) {
    return NextResponse.json(
      {
        evaluationAssign,
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
