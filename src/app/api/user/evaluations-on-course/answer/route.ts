import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user"; // Asegúrate de que el path sea correcto
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const questionId = formData.get("questionId") as string;
  const evaluationId = formData.get("evaluationId") as string;
  const answer = formData.get("answer") as string;
  const userId = formData.get("userId") as string;
  try {
    await connectMongoDB();

    // Encuentra al usuario por ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Asegúrate de que evaluationsOnCourse no es undefined
    if (!user.evaluationsOnCourse) {
      return NextResponse.json(
        { message: "No evaluations found for this user" },
        { status: 404 }
      );
    }
    // Encuentra la evaluación correspondiente
    const evaluation = user.evaluationsOnCourse.find(
      (evalItem: any) =>
        evalItem.evaluationId &&
        evalItem.evaluationId.toString() === evaluationId
    );
    if (!evaluation) {
      return NextResponse.json(
        { message: "Evaluation not found" },
        { status: 404 }
      );
    }

    // Asegúrate de que answers no es undefined
    if (!evaluation.answers) {
      return NextResponse.json(
        { message: "No answers found for this evaluation" },
        { status: 404 }
      );
    }

    // Encuentra la pregunta correspondiente dentro de la evaluación
    // Encuentra la pregunta correspondiente dentro de la evaluación
    let question = evaluation.answers.find(
      (ans: any) => ans.questionId && ans.questionId.toString() === questionId
    );

    if (!question) {
      // Si no se encuentra la pregunta, crea una nueva
      question = {
        questionId: questionId,
        answer: answer,
      };
      evaluation.answers.push(question);
    } else {
      // Si se encuentra la pregunta, actualiza la respuesta
      question.answer = answer;
    }
    // Guarda los cambios en el usuario
    await user.save();

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
