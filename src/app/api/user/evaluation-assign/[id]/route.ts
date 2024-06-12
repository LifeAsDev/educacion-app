import { connectMongoDB } from "@/lib/mongodb";
import Asignatura from "@/schemas/asignatura";
import { NextResponse } from "next/server";
import Curso from "@/schemas/curso";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationTest from "@/schemas/evaluationTest";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import User from "@/schemas/user";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");
  const rol = searchParams.get("rol");
  const id = params.id;

  try {
    await connectMongoDB();

    const resQuery: any = {};
    if (rol === "Estudiante") {
      const evaluationAssignFind = await EvaluationAssign.findById(id);
      await evaluationAssignFind.populate([
        {
          path: "curso",
          model: Curso,
        },
        {
          path: "asignatura",
          model: Asignatura,
        },
        {
          path: "evaluationId",
          model: EvaluationTest,
        },
      ]);
      const evaluationOnCourseFind = await EvaluationOnCourse.findOne({
        estudianteId: userId,
        evaluationAssignId: id,
      });
      if (rol && rol === "Estudiante") {
        const userEstudiante = await User.findById(userId);

        if (userEstudiante) {
          if (evaluationOnCourseFind) {
            const currentTime = new Date();
            const startTime = new Date(evaluationOnCourseFind.startTime);
            const elapsedMinutes =
              (currentTime.getTime() - startTime.getTime()) / 60000;

            let updateFields: any = {};

            if (
              evaluationOnCourseFind.state === "En Progreso" &&
              elapsedMinutes > (evaluationOnCourseFind.tiempo ?? 90)
            ) {
              evaluationOnCourseFind.state = "Completada";
              evaluationOnCourseFind.endTime = currentTime;
              updateFields = {
                state: evaluationOnCourseFind.state,
                endTime: evaluationOnCourseFind.endTime,
              };
            }

            if (evaluationOnCourseFind.state === "Asignada") {
              evaluationOnCourseFind.state = "En progreso";
              evaluationOnCourseFind.startTime = currentTime;
              updateFields = {
                state: evaluationOnCourseFind.state,
                startTime: evaluationOnCourseFind.startTime,
              };
            }

            if (evaluationOnCourseFind.state === "Completada") {
              return NextResponse.json(
                { message: "EvaluationTest completed" },
                { status: 404 }
              );
            }

            if (Object.keys(updateFields).length > 0) {
              await evaluationOnCourseFind.update(
                { updateFields },
                { new: true }
              );
            }
          }
        }
      }
      resQuery.evaluationAssignFind = evaluationAssignFind;
      resQuery.evaluationTest = evaluationAssignFind.evaluationId;
      resQuery.evalOnCourse = evaluationOnCourseFind;
    } else {
      const evaluationTestFind = await EvaluationTest.findById(id);
      resQuery.evaluationTest = evaluationTestFind;
    }
    return NextResponse.json({
      ...resQuery,
      message: "Evaluation added successfully",
    });
  } catch (error) {
    console.error("Error adding Evaluation:", error);
    return NextResponse.json(
      { message: "Error adding Evaluation" },
      { status: 500 }
    );
  }
}
