import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationTest from "@/schemas/evaluationTest";
import Question from "@/models/question";
import { uploadFile } from "@/lib/functionToFiles";
import { getFileTypeFromBuffer } from "@/lib/functionToFiles";
import mongoose, { Types } from "mongoose";
export const dynamic = "force-dynamic";
import Asignatura from "@/schemas/asignatura";
import User from "@/schemas/user";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import Curso from "@/schemas/curso";
import EvaluationAssign from "@/schemas/evaluationAssign";
import evaluationTest from "@/schemas/evaluationTest";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const estudianteId = params.userId;

  try {
    await connectMongoDB();
    const evaluationsOnCourseFind = await EvaluationOnCourse.find({
      estudianteId,
      state: { $ne: "Completada" },
    });
    await EvaluationOnCourse.populate(evaluationsOnCourseFind, [
      {
        path: "evaluationAssignId",
        model: EvaluationAssign,
        populate: {
          path: "evaluationId",
          model: EvaluationTest,
          populate: {
            path: "asignatura",
            model: Asignatura,
          },
        },
      },
    ]);
    const evaluationsOnCourseMap = evaluationsOnCourseFind.map((item) => {
      return {
        _id: item._id,
        name: item.evaluationAssignId.evaluationId.name,
        type: item.evaluationAssignId.evaluationId.type,
        difficulty: item.evaluationAssignId.evaluationId.difficulty,
        tiempo: item.evaluationAssignId.evaluationId.tiempo,
      };
    });
    console.log(evaluationsOnCourseMap);

    return NextResponse.json(
      {
        evaluationTests: evaluationsOnCourseMap,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: "error retrieving evaluation tests",
      },
      { status: 400 }
    );
  }
}
