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
  try {
    await connectMongoDB();

    const query: any = {};
    if (curso !== null) query.curso = curso;
    if (asignatura !== null) query.asignatura = asignatura;
    if (profesorId !== null) query.profesorId = profesorId;

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

    console.log(evaluationAssigneds);
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
