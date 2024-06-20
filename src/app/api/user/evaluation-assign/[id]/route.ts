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
      if (evaluationAssignFind) {
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

              if (
                evaluationAssignFind.state === "Completada" &&
                evaluationOnCourseFind.state !== "Completada"
              ) {
                evaluationOnCourseFind.state = "Completada";
                evaluationOnCourseFind.endTime = currentTime;
                evaluationOnCourseFind.startTime = currentTime;

                await evaluationOnCourseFind.save();
              }

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
                await EvaluationOnCourse.findByIdAndUpdate(
                  evaluationOnCourseFind._id,
                  updateFields,
                  { new: true }
                );
              }
            }
          }
        }
        if (evaluationOnCourseFind.state === "Completada") {
          return NextResponse.json(
            { message: "Error adding Evaluation" },
            { status: 500 }
          );
        }
        resQuery.evaluationAssignFind = evaluationAssignFind;
        resQuery.evaluationTest = evaluationAssignFind.evaluationId;
        resQuery.evalOnCourse = evaluationOnCourseFind;
      } else {
        console.log("evalAssign not found");

        return NextResponse.json(
          { message: "Error adding Evaluation" },
          { status: 500 }
        );
      }
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
export async function PATCH(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const evaluationAssignId = params.id;

  try {
    await connectMongoDB();

    const evaluationAssignFind = await EvaluationAssign.findByIdAndUpdate(
      evaluationAssignId,
      { state: "Completada" }
    );

    const evaluationTestFind = await EvaluationTest.findById(
      evaluationAssignFind.evaluationId
    ).select("questionArr");

    const questions = evaluationTestFind.questionArr;

    const evaluationsOnCourseFind = await EvaluationOnCourse.find({
      evaluationAssignId,
    });

    /*     await EvaluationOnCourse.populate(evaluationsOnCourseFind, {
      path: "estudianteId",
      model: User,
    }); */
    console.log(questions.map((item: { _id: any }) => item._id));
    let canSave = false;
    for (const evaluationOnCourse of evaluationsOnCourseFind) {
      const openQuestionAnswer: {
        estudianteId: string;
        checkAnswers: {
          questionId: string;
          answer: string;
        }[];
      } = {
        estudianteId: evaluationOnCourse.estudianteId,
        checkAnswers: [],
      };
      for (const answer of evaluationOnCourse.answers) {
        const question = questions.find((item: { _id: string }) => {
          //  console.log({ questionId: item._id });
          return item._id.toString() === answer.questionId.toString();
        });

        console.log({ answerQuestionId: answer.questionId });

        if (
          question &&
          question.openAnswers &&
          !question.openAnswers.includes(answer.answer)
        ) {
          openQuestionAnswer.checkAnswers.push({
            questionId: answer.questionId,
            answer: answer.answer,
          });
        }
      }
      if (openQuestionAnswer.checkAnswers.length) {
        evaluationAssignFind.openQuestionAnswer.push(openQuestionAnswer);
        canSave = true;
      }
    }
    console.log(evaluationAssignFind.openQuestionAnswer);
    if (canSave) evaluationAssignFind.save();

    return NextResponse.json({
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
