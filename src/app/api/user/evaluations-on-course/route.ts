import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";
import UserType from "@/models/user";
import { MonitorArr } from "@/components/evaluation/evaluation";
import evaluationTest from "@/schemas/evaluationTest";
import { formatSecondsToMinutes } from "@/lib/calculationFunctions";

export async function POST(req: Request) {
  const formData = await req.formData();
  const curso = JSON.parse(formData.get("curso") as string);
  const evaluationId = formData.get("evaluationId") as string;

  try {
    await connectMongoDB();

    const users = await User.find({
      rol: "Estudiante",
      "curso.0": { $in: curso },
      review: false,
    }).select("nombre apellido evaluationsOnCourse");

    const updatedUsers: any = users.map((user) => {
      const evaluations = user.evaluationsOnCourse || [];

      const evaluationExists = evaluations.some(
        (evaluation: { evaluationId: string }) =>
          evaluation.evaluationId.toString() === evaluationId
      );

      const newEvaluations = evaluationExists
        ? evaluations
        : [...evaluations, { evaluationId: evaluationId, answer: [] }];

      const newUser = {
        _id: user._id,
        evaluationsOnCourse: newEvaluations,
      };

      return newUser;
    });

    for (const updatedUser of updatedUsers) {
      const userInstance = await User.updateOne(
        { _id: updatedUser._id },
        { evaluationsOnCourse: updatedUser.evaluationsOnCourse }
      );
    }

    return NextResponse.json({
      users: updatedUsers,
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
  const curso: string[] = searchParams.getAll("curso");
  const rol: string = searchParams.get("rol")!;
  try {
    await connectMongoDB();
    const users = await User.find({
      $and: [{ "curso.0": { $in: curso } }, { rol: "Estudiante" }],
    });

    for (const user of users) {
      // Paso 2: Obtener el array evaluationsOnCourse del usuario
      const evaluationsOnCourse = user.evaluationsOnCourse;

      // Paso 3: Filtrar los elementos que tienen un evaluationId válido (no null)
      const validEvaluations = evaluationsOnCourse.filter(
        (evaluation: { evaluationId: null }) => {
          return !!evaluation.evaluationId;
        }
      );

      // Paso 4: Si el array filtrado es diferente al original, actualizar el documento del usuario
      if (evaluationsOnCourse.length !== validEvaluations.length) {
        user.evaluationsOnCourse = validEvaluations;
        await user.save();
      }
    }

    const usersMonitor: MonitorArr[] = [];
    const currentTime = new Date();

    let yo = 0;

    for (const user of users) {
      await user.populate({
        path: "evaluationsOnCourse.evaluationId",
        model: evaluationTest,
      });
      for (const evaluationOnCourse of user.evaluationsOnCourse) {
        if (evaluationOnCourse.evaluationId) {
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
            console.log("user>eonCourse");

            evaluationOnCourse.state = "Completada";
            evaluationOnCourse.endTime = currentTime;
            await user.save();
          }

          const progress: number[] = [];
          const questionCount =
            evaluationOnCourse.evaluationId.questionArr.length;

          evaluationOnCourse.answers.forEach(
            (answerItem: { questionId: any; answer: any }) => {
              const questionArrItem =
                evaluationOnCourse.evaluationId.questionArr.find(
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
            nombre: `${user.nombre} ${user.apellido}`,
            prueba: evaluationOnCourse.evaluationId.name,
            state: evaluationOnCourse.state,
            progress: progress,
            questionCount,
            userId: user._id,
            pruebaId: evaluationOnCourse.evaluationId._id,
            startTime: evaluationOnCourse.startTime,
            endTime: evaluationOnCourse.endTime,
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
      }
    }
    return NextResponse.json({
      users: usersMonitor,
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
