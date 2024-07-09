import { connectMongoDB } from "@/lib/mongodb";
import Asignatura from "@/schemas/asignatura";
import { NextResponse } from "next/server";
import Curso from "@/schemas/curso";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationTest from "@/schemas/evaluationTest";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);

  const curso = searchParams.get("curso");
  const asignatura = searchParams.get("asignatura");
  const profesorId = searchParams.get("profesorId");
  const state = searchParams.get("state");

  try {
    await connectMongoDB();

    const query: any = {};
    if (curso !== null) query.curso = curso;
    if (asignatura !== null) query.asignatura = asignatura;
    if (profesorId !== null) query.profesorId = profesorId;
    /*   if (state !== null) {
      if (state === "Completadas") {
        query.state = "Completa";
      }
      if (state === "Asignadas") {
        query.state = "Asignada";
      }
      if (state === "Corregir") {
        openQuestionAnswer;
      }
    }
 */
    const evaluationAssigneds = await EvaluationAssign.find(query);

    await EvaluationAssign.populate(evaluationAssigneds, [
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

    return NextResponse.json({
      evaluationAssigneds: evaluationAssigneds,
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
