import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";
import Curso from "@/schemas/curso";
import mongoose, { Types } from "mongoose";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import EvaluationTest from "@/schemas/evaluationTest";
import EvaluationAssign from "@/schemas/evaluationAssign";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");
  const cursos = searchParams.getAll("cursos");
  const userId = params.userId;

  await connectMongoDB();

  const findEvaluationOnCourse = await EvaluationOnCourse.find({
    estudianteId: userId,
    state: "Completada",
  });

  await EvaluationOnCourse.populate(findEvaluationOnCourse, {
    path: "evaluationAssignId",
    model: EvaluationAssign,
    populate: {
      path: "evaluationId",
      model: EvaluationTest,
    },
  });

  const evaluationList = [];

  for (const evaluationOnCourse of findEvaluationOnCourse) {
    const progress = [];
    let totalPoints = 0;

    for (const question of evaluationOnCourse.evaluationAssignId.evaluationId
      .questionArr) {
      const points =
        !question.puntos || question.puntos === 0 ? 1 : question.puntos;

      totalPoints += points;

      if (question.type === "multiple") {
        const answer = evaluationOnCourse.answers.find(
          (answer: { questionId: string }) =>
            answer.questionId.toString() === question._id.toString()
        );
        if (answer && answer.answer === "a") {
          progress.push(points);
        } else {
          progress.push(0);
        }
      } else if (question.type === "open") {
        const answer = evaluationOnCourse.answers.find(
          (answer: { questionId: string }) =>
            answer.questionId.toString() === question._id.toString()
        );
        if (answer && question.openAnswers.includes(answer.answer)) {
          progress.push(points);
        } else {
          progress.push(0);
        }
      }
    }

    const percentage =
      Math.round(
        (progress.reduce((accumulator, currentValue) => {
          return accumulator + currentValue;
        }, 0) /
          totalPoints) *
          100
      ) || 0;

    evaluationList.push({
      name: evaluationOnCourse.evaluationAssignId.evaluationId.name,
      _id: evaluationOnCourse._id,
      answersCorrect: progress.reduce((accumulator, currentValue) => {
        if (currentValue > 0) {
          return accumulator + 1;
        }
        return accumulator;
      }, 0),
      answersCount: progress.length,
      percentage,
    });
  }

  if (findEvaluationOnCourse) {
    return NextResponse.json(
      {
        evaluationList,
        findEvaluationOnCourse,
        mainPercentage: Math.round(
          evaluationList.reduce(
            (accumulator, currentValue) =>
              accumulator + currentValue.percentage,
            0
          ) / evaluationList.length
        ),
        message: "Success",
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

interface Answer {
  questionId: Types.ObjectId;
  answer: string;
}

interface Question {
  _id: Types.ObjectId;
  type: string;
  puntos?: number;
  openAnswers?: string[];
}

interface Evaluation {
  name: string;
  questionArr: Question[];
}

interface EvaluationAssign {
  evaluationId: Evaluation;
}

interface EvaluationOnCourseModel {
  _id: Types.ObjectId;
  evaluationAssignId: EvaluationAssign;
  answers: Answer[];
}

interface EvaluationResult {
  name: string;
  _id: Types.ObjectId;
  answersCorrect: number;
  answersCount: number;
  percentage: number;
}

export async function getEvaluationsOnCourse(
  userId: string,
  evaluationsOnCourse: EvaluationOnCourseModel[]
): Promise<{
  evaluationList: EvaluationResult[];
  mainPercentage: number;
  message: string;
}> {
  const evaluationList: EvaluationResult[] = [];

  for (const evaluationOnCourse of evaluationsOnCourse) {
    const progress: number[] = [];
    let totalPoints = 0;

    for (const question of evaluationOnCourse.evaluationAssignId.evaluationId
      .questionArr) {
      const points =
        !question.puntos || question.puntos === 0 ? 1 : question.puntos;
      totalPoints += points;

      const answer = evaluationOnCourse.answers.find(
        (answer) => answer.questionId.toString() === question._id.toString()
      );

      if (question.type === "multiple") {
        progress.push(answer && answer.answer === "a" ? points : 0);
      } else if (question.type === "open") {
        progress.push(
          answer && question.openAnswers?.includes(answer.answer) ? points : 0
        );
      }
    }

    const percentage =
      Math.round(
        (progress.reduce((acc, val) => acc + val, 0) / totalPoints) * 100
      ) || 0;

    evaluationList.push({
      name: evaluationOnCourse.evaluationAssignId!.evaluationId.name,
      _id: evaluationOnCourse._id,
      answersCorrect: progress.reduce(
        (acc, val) => (val > 0 ? acc + 1 : acc),
        0
      ),
      answersCount: progress.length,
      percentage,
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
