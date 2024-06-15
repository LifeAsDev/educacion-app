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

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);
  const curso = searchParams.get("curso");

  const estudianteId = params.userId;

  try {
    await connectMongoDB();
    const evaluationsAssignFind = await EvaluationAssign.find({ curso });
    let evaluationsOnCourseFind = await EvaluationOnCourse.find({
      estudianteId,
    });

    const newEvaluationsOnCourse = evaluationsAssignFind
      .filter((itemAssign) =>
        evaluationsOnCourseFind.every(
          (evaluationOnCourseItem) =>
            evaluationOnCourseItem.evaluationAssignId.toString() !==
            itemAssign._id.toString()
        )
      )
      .map((itemAssign) => {
        return {
          evaluationAssignId: itemAssign._id,
          estudianteId,
        };
      });

    await EvaluationOnCourse.create(newEvaluationsOnCourse);

    evaluationsOnCourseFind = await EvaluationOnCourse.find({
      estudianteId,
      state: { $ne: "Completada" },
    });
    const currentTime = new Date();

    for (const evaluationOnCourse of evaluationsOnCourseFind) {
      const startTime = new Date(evaluationOnCourse.startTime);
      const elapsedMinutes =
        (currentTime.getTime() - startTime.getTime()) / 1000 / 60;
      const evalAssignFind = await EvaluationAssign.findById(
        evaluationOnCourse.evaluationAssignId
      );
      if (
        evalAssignFind.state === "Completada" &&
        evaluationOnCourse.state !== "Completada"
      ) {
        evaluationOnCourse.state = "Completada";
        evaluationOnCourse.endTime = currentTime;
        evaluationOnCourse.startTime = currentTime;

        await evaluationOnCourse.save();
      }

      if (
        elapsedMinutes &&
        elapsedMinutes > 90 &&
        evaluationOnCourse.state === "En progreso"
      ) {
        evaluationOnCourse.state = "Completada";
        evaluationOnCourse.endTime = currentTime;
        await evaluationOnCourse.save();
      }
    }

    evaluationsOnCourseFind = await EvaluationOnCourse.find({
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
        _id: item.evaluationAssignId._id,
        name: item.evaluationAssignId.evaluationId.name,
        type: item.evaluationAssignId.evaluationId.type,
        difficulty: item.evaluationAssignId.evaluationId.difficulty,
        tiempo: item.evaluationAssignId.evaluationId.tiempo,
        asignatura: item.evaluationAssignId.evaluationId.asignatura,
      };
    });

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
