import { connectMongoDB } from "@/lib/mongodb";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import { NextResponse } from "next/server";
import EvaluationAssign from "@/schemas/evaluationAssign";
import evaluationAssign from "@/schemas/evaluationAssign";

export async function POST(req: Request) {
  const formData = await req.formData();
  const questionId = formData.get("questionId") as string;
  const evaluationAssignId = formData.get("evaluationAssignId") as string;
  const answer = formData.get("answer") as string;
  const estudianteId = formData.get("userId") as string;
  try {
    await connectMongoDB();

    // Encuentra al usuario por ID
    const evaluationOnCourseFind = await EvaluationOnCourse.findOne({
      evaluationAssignId,
      estudianteId,
    });

    // Asegúrate de que evaluationsOnCourse no es undefined
    if (!evaluationOnCourseFind) {
      return NextResponse.json(
        { message: "No evaluations found for this user" },
        { status: 404 }
      );
    }
    const evaluatioAssignFind = await EvaluationAssign.findById(
      evaluationAssignId
    );

    if (
      evaluationOnCourseFind.state === "Completada" ||
      evaluatioAssignFind.state === "Completada"
    ) {
      return NextResponse.json({ message: "Evaluation done" }, { status: 200 });
    }

    // Asegúrate de que answers no es undefined
    if (!evaluationOnCourseFind.answers) {
      return NextResponse.json(
        { message: "No answers found for this evaluation" },
        { status: 404 }
      );
    }

    // Encuentra la pregunta correspondiente dentro de la evaluación
    // Encuentra la pregunta correspondiente dentro de la evaluación
    let question = evaluationOnCourseFind.answers.find(
      (ans: any) => ans.questionId && ans.questionId.toString() === questionId
    );

    if (!question) {
      // Si no se encuentra la pregunta, crea una nueva
      question = {
        questionId: questionId,
        answer: answer,
      };
      evaluationOnCourseFind.answers.push(question);
    } else {
      // Si se encuentra la pregunta, actualiza la respuesta
      question.answer = answer;
    }
    // Guarda los cambios en el usuario
    await evaluationOnCourseFind.save();

    return NextResponse.json({
      message: "Answer set successfully",
    });
  } catch (error) {
    console.error("Error setting Answer:", error);
    return NextResponse.json(
      { message: "Error setting Answer" },
      { status: 500 }
    );
  }
}
