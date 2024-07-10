import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";
import Curso from "@/schemas/curso";
import mongoose, { Types } from "mongoose";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import EvaluationTest from "@/schemas/evaluationTest";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationResult from "@/models/evaluationResult";
import EvaluationOnCourseModel from "@/models/evaluationOnCourse";
import UserResult from "@/models/userResult";
import UserModel from "@/models/user";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");
  const cursos = searchParams.getAll("cursos");

  await connectMongoDB();

  let aggregatePipeline: any[] = [];
  if (cursos) {
    // Convertir cada ID en ObjectId
    const objectIdCursos = cursos.map((id) => new Types.ObjectId(id));

    aggregatePipeline.push({
      $match: {
        "curso.0": { $in: objectIdCursos },
      },
    });
  }

  aggregatePipeline.push({
    $match: {
      review: false,
    },
  });

  if (keyword !== "") {
    aggregatePipeline.push({
      $match: {
        $or: [
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$nombre", " ", "$apellido"] },
                regex: keyword,
                options: "i",
              },
            },
          },
          { dni: { $regex: keyword, $options: "i" } },
        ],
      },
    });
  }

  aggregatePipeline.push({
    $match: {
      rol: "Estudiante",
    },
  });

  const users = await User.aggregate(aggregatePipeline);

  await User.populate(users, {
    path: "curso",
    model: Curso,
  });
  const newUsersResults: UserResult[] = [];
  let generalScore = 0;

  for (const user of users) {
    const results = await getEvaluationsOnCourse(user._id);
    const newUserResult = { user: user as UserModel, results };

    generalScore += results.mainPercentage;
    newUsersResults.push(newUserResult);
  }

  generalScore = Math.round(generalScore / newUsersResults.length) || 0;
  if (users) {
    return NextResponse.json(
      {
        users: newUsersResults,
        generalScore,
        message: "Users found",
      },
      { status: 200 }
    );
  }
  return NextResponse.json(
    {
      message: "Not found users",
    },
    { status: 200 }
  );
}

async function getEvaluationsOnCourse(userId: string): Promise<{
  evaluationList: EvaluationResult[];
  mainPercentage: number;
  message: string;
}> {
  const evaluationList: EvaluationResult[] = [];
  await connectMongoDB();

  const evaluationsOnCourse: EvaluationOnCourseModel[] =
    await EvaluationOnCourse.find({
      estudianteId: userId,
      state: "Completada",
    });

  await EvaluationOnCourse.populate(evaluationsOnCourse, {
    path: "evaluationAssignId",
    model: EvaluationAssign,
    populate: {
      path: "evaluationId",
      model: EvaluationTest,
    },
  });

  for (const evaluationOnCourse of evaluationsOnCourse) {
    const progress: number[] = [];
    let totalPoints = 0;

    for (const question of evaluationOnCourse.evaluationAssignId.evaluationId
      .questionArr) {
      const points =
        !question.puntos || question.puntos === 0 ? 1 : question.puntos;
      totalPoints += points;

      const answer = evaluationOnCourse.answers.find(
        (answer) => answer.questionId.toString() === question._id!.toString()
      );

      if (question.type === "multiple") {
        progress.push(answer && answer.answer === "a" ? points : 0);
      } else if (question.type === "open") {
        progress.push(
          answer && question.openAnswers?.includes(answer.answer) ? points : 0
        );
      }
    }
    const points = progress.reduce((acc, val) => acc + val, 0);
    const percentage = Math.round((points / totalPoints) * 100) || 0;

    evaluationList.push({
      name: evaluationOnCourse.evaluationAssignId!.evaluationId.name,
      _id: evaluationOnCourse._id,
      answersCorrect: progress.reduce(
        (acc, val) => (val > 0 ? acc + 1 : acc),
        0
      ),
      answersCount: progress.length,
      percentage,
      score: points,
      totalScore: totalPoints,
    });
  }

  const mainPercentage = Math.round(
    evaluationList.reduce((acc, curr) => acc + curr.percentage, 0) /
      evaluationList.length
  );

  return {
    evaluationList,
    mainPercentage,
    message: evaluationsOnCourse.length
      ? "Success"
      : "Not found evaluationsOnCourse",
  };
}
