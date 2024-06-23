import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationTest from "@/schemas/evaluationTest";

export async function PATCH(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const correct = searchParams.get("correct");
  const estudianteId = searchParams.get("estudianteId");
  const checkAnswerId = searchParams.get("checkAnswerId");

  const evaluationAssignId = params.id;
  console.log({ correct, estudianteId, checkAnswerId, evaluationAssignId });
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

    const openQuestionAnswers = evaluationAssign.openQuestionAnswer;
    let answerToAdd: { questionId?: any; answer: any; _id?: any } = {
      questionId: "any",
      answer: "any",
      _id: "any",
    };

    // Encuentra y elimina el checkAnswer, y guarda la respuesta si es correcta
    evaluationAssign.openQuestionAnswer = openQuestionAnswers
      .map((openQuestionAnswer: { estudianteId: any; checkAnswers: any[] }) => {
        if (openQuestionAnswer.estudianteId.toString() === estudianteId) {
          openQuestionAnswer.checkAnswers =
            openQuestionAnswer.checkAnswers.filter(
              (checkAnswer: { _id: any; answer: string }) => {
                if (
                  checkAnswer._id.toString() === checkAnswerId &&
                  correct === "correct"
                ) {
                  answerToAdd = checkAnswer;
                }
                return checkAnswer._id.toString() !== checkAnswerId;
              }
            );
        }
        return openQuestionAnswer;
      })
      .filter(
        (openQuestionAnswer: { checkAnswers: any[] }) =>
          openQuestionAnswer.checkAnswers.length > 0
      );
    // Si la respuesta es correcta, agregarla a openAnswers de EvaluationTest
    if (correct === "correct" && answerToAdd) {
      const evaluationTest = await EvaluationTest.findById(
        evaluationAssign.evaluationId
      );

      if (!evaluationTest) {
        return NextResponse.json(
          { message: "EvaluationTest no encontrado" },
          { status: 404 }
        );
      }

      evaluationTest.questionArr.forEach(
        (question: {
          _id: { toString: () => string | null };
          openAnswers: string[];
        }) => {
          if (question._id.toString() === answerToAdd.questionId) {
            if (!question.openAnswers) {
              question.openAnswers = [];
            }
            question.openAnswers.push(answerToAdd.answer);
          }
        }
      );

      await evaluationTest.save();
    }

    // Guarda los cambios en EvaluationAssign
    await evaluationAssign.save();
    return NextResponse.json({
      message: "checkAnswer eliminado y respuesta añadida correctamente",
    });
  } catch (error) {
    console.error("Error eliminando checkAnswer:", error);
    return NextResponse.json(
      { message: "Error eliminando checkAnswer" },
      { status: 500 }
    );
  }
}
