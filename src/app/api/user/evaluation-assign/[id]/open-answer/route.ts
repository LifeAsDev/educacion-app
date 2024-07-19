import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationTest from "@/schemas/evaluationTest";
import mongoose from "mongoose";

export async function PATCH(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const correct = searchParams.get("correct");
  const estudianteId = searchParams.get("estudianteId");
  const checkAnswerId = searchParams.get("checkAnswerId");

  const evaluationAssignId = params.id;

  try {
    await connectMongoDB();

    const evaluationAssign = await EvaluationAssign.findById(
      evaluationAssignId
    );
    if (!evaluationAssign) {
      return NextResponse.json(
        { message: "EvaluationAssign no encontrado" },
        { status: 404 }
      );
    }

    // Encuentra el checkAnswer y almacena la respuesta si es correcta
    let answerToAdd: { questionId?: any; answer: any; _id?: any } | null = null;

    for (const openQuestionAnswer of evaluationAssign.openQuestionAnswer) {
      if (openQuestionAnswer.estudianteId.toString() === estudianteId) {
        const checkAnswer = openQuestionAnswer.checkAnswers.find(
          (checkAnswer: { _id: any }) =>
            checkAnswer._id.toString() === checkAnswerId
        );
        if (checkAnswer && correct === "correct") {
          answerToAdd = checkAnswer;
        }
        break;
      }
    }

    // Elimina el checkAnswer del array utilizando $pull
    await EvaluationAssign.updateOne(
      {
        _id: evaluationAssignId,
        "openQuestionAnswer.estudianteId": estudianteId,
      },
      { $pull: { "openQuestionAnswer.$.checkAnswers": { _id: checkAnswerId } } }
    );

    // Borra openQuestionAnswer si checkAnswers está vacío
    await EvaluationAssign.updateOne(
      { _id: evaluationAssignId },
      {
        $pull: {
          openQuestionAnswer: {
            estudianteId: estudianteId,
            checkAnswers: { $size: 0 },
          },
        },
      }
    );

    // Si la respuesta es correcta, agregarla a openAnswers de EvaluationTest utilizando $push
    if (correct === "correct" && answerToAdd) {
      await EvaluationTest.updateOne(
        {
          _id: evaluationAssign.evaluationId,
          "questionArr._id": answerToAdd.questionId,
        },
        { $push: { "questionArr.$.openAnswers": answerToAdd.answer } }
      );
    }

    return NextResponse.json({
      message: "checkAnswer eliminado y respuesta añadida correctamente",
    });
  } catch (error: any) {
    // Convertimos el error a `any`
    console.error("Error eliminando checkAnswer:", error);
    return NextResponse.json(
      { message: "Error eliminando checkAnswer" },
      { status: 500 }
    );
  }
}
