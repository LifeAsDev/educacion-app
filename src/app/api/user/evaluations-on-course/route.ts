import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";
import { MonitorArr } from "@/components/evaluation/evaluationsOnCourseTable/evaluationsOnCourseTable";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import Curso from "@/schemas/curso";
import Asignatura from "@/schemas/asignatura";
import EvaluationTest from "@/schemas/evaluationTest";

export async function POST(req: Request) {
  const formData = await req.formData();
  const curso = JSON.parse(formData.get("curso") as string);
  const evaluationId = formData.get("evaluationId") as string;
  const profesorId = formData.get("profesorId") as string;
  const asignatura = formData.get("asignatura") as string;

  try {
    await connectMongoDB();
    const newEvaluationAssignQuery: any = {
      evaluationId,
      profesorId,
      curso,
      state: "Asignada",
    };
    if (asignatura !== "N/A") newEvaluationAssignQuery.asignatura = asignatura;

    const newEvaluationAssign = await EvaluationAssign.create(
      newEvaluationAssignQuery
    );

    return NextResponse.json({
      evaluationAssigned: newEvaluationAssign,
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const evaluationAssignId = searchParams.get("evaluationAssignId");

  try {
    await connectMongoDB();
    const evaluationAssignFind = await EvaluationAssign.findById(
      evaluationAssignId
    );
    await EvaluationAssign.populate(evaluationAssignFind, [
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
    let users = [];
    if (evaluationAssignFind.curso) {
      users = await User.find({
        "curso.0": evaluationAssignFind.curso._id,
        rol: "Estudiante",
      }).select("nombre");
    }
    let evaluationsOnCourseFind = await EvaluationOnCourse.find({
      evaluationAssignId,
    });

    const newEvaluationsOnCourse = users
      .filter((userItem) =>
        evaluationsOnCourseFind.every(
          (evaluationOnCourseItem) =>
            evaluationOnCourseItem.estudianteId.toString() !==
            userItem._id.toString()
        )
      )
      .map((userItem) => {
        return {
          evaluationAssignId,
          estudianteId: userItem._id,
        };
      });

    await EvaluationOnCourse.create(newEvaluationsOnCourse);

    evaluationsOnCourseFind = await EvaluationOnCourse.find({
      evaluationAssignId,
    });

    await EvaluationOnCourse.populate(evaluationsOnCourseFind, {
      path: "estudianteId",
      model: User,
    });

    const usersMonitor: MonitorArr[] = [];
    const currentTime = new Date();

    let yo = 0;

    for (const evaluationOnCourse of evaluationsOnCourseFind) {
      yo++;

      const startTime = new Date(evaluationOnCourse.startTime);
      const elapsedMinutes =
        (currentTime.getTime() - startTime.getTime()) / 1000 / 60;
      /* 
          if (yo === 1) {
            console.log({
              startTime,
              currentTime,
              beautifulTime: formatSecondsToMinutes(elapsedMinutes * 60),
              elapsedMinutes,
              name: `${user.nombre} ${user.apellido}`,
              state: evaluationOnCourse.state,
            });
          } */

      if (
        elapsedMinutes &&
        elapsedMinutes > 90 &&
        evaluationOnCourse.state === "En progreso"
      ) {
        evaluationOnCourse.state = "Completada";
        evaluationOnCourse.endTime = currentTime;
        await evaluationOnCourse.save();
      }

      const progress: number[] = [];
      const questionCount = Math.max(
        evaluationAssignFind.evaluationId.questionArr.length,
        1
      );

      evaluationOnCourse.answers.forEach(
        (answerItem: { questionId: any; answer: any }) => {
          const questionArrItem =
            evaluationAssignFind.evaluationId.questionArr.find(
              (questionItem: { _id: any }) => {
                return (
                  questionItem._id.toString() ===
                  answerItem.questionId.toString()
                );
              }
            );
          if (questionArrItem) {
            if (questionArrItem.type === "multiple") {
              if (answerItem.answer === "a") progress.push(1);
              else progress.push(0);
            } else {
              progress.push(2);
            }
          }
        }
      );

      const userMonitor: MonitorArr = {
        nombre: `${evaluationOnCourse.estudianteId.nombre} ${evaluationOnCourse.estudianteId.apellido}`,
        prueba: evaluationAssignFind.evaluationId.name,
        state: evaluationOnCourse.state,
        progress: progress,
        questionCount,
        userId: evaluationOnCourse.estudianteId._id,
        pruebaId: evaluationAssignFind.evaluationId._id,
        startTime: evaluationOnCourse.startTime,
        endTime: evaluationOnCourse.endTime,
        tiempo: evaluationAssignFind.evaluationId.tiempo,
        asignatura: evaluationAssignFind.evaluationId.asignatura,
      };

      while (progress.length < questionCount) {
        if (evaluationOnCourse.state === "Completada") {
          progress.push(0);
        } else {
          progress.push(3);
        }
      }
      usersMonitor.push(userMonitor);
    }
    return NextResponse.json({
      evaluationAssignFind: evaluationAssignFind,
      usersMonitor,
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
