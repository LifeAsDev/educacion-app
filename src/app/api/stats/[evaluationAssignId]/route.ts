import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import EvaluationTest from "@/schemas/evaluationTest";
import EvaluationAssign from "@/schemas/evaluationAssign";
import User from "@/schemas/user";
import Curso from "@/schemas/curso";
import EvaluationOnCourseModel from "@/models/evaluationOnCourse";
import getEvaluationsOnCourse from "@/lib/userStatsFunction";
import Asignatura from "@/schemas/asignatura";
import FrecuenciaItem from "@/models/frecuenciaItem";

export async function GET(req: Request, { params }: any) {
  const { searchParams } = new URL(req.url);
  const curso = searchParams.get("curso");
  const evaluationAssignId = params.evaluationAssignId;

  await connectMongoDB();

  const evaluationAssign = await EvaluationAssign.findById(
    evaluationAssignId
  ).populate([
    {
      path: "evaluationId",
      model: EvaluationTest,
      populate: {
        path: "asignatura",
        model: Asignatura,
      },
    },
    { path: "profesorId", model: User },
    { path: "curso", model: Curso },
  ]);

  const evaluationsOnCourse: EvaluationOnCourseModel[] =
    await EvaluationOnCourse.find({
      evaluationAssignId: evaluationAssign._id,
    }).populate([{ path: "estudianteId", model: User }]);

  const newUsersResults = [];
  let generalScore = 0;
  let userIndex = 0;
  let questionsLabel: string[] = [];
  let questionsCorrect: number[] = [];
  let estudiantesLogro: number[] = [0, 0, 0];
  let puntajePromedio = 0;
  let puntajeTotal = 0;
  let tiempoPromedio = 0;

  const tableFrecuencia: FrecuenciaItem[] = [];
  for (let i = 1; i <= 10; i++) {
    const frecuenciaItem = {
      acierto: i * 10,
      frecuenciaAbsoluta: 0,
      frecuenciaAbsolutaAcumulada: 0,
      frecuenciaRelativa: 0,
      frecuenciaRelativaAcumulada: 0,
      frecuenciaRelativaPercentage: 0,
    };
    tableFrecuencia.push(frecuenciaItem);
  }

  for (const evaluationOnCourse of evaluationsOnCourse) {
    const results = await getEvaluationsOnCourse(
      evaluationOnCourse.estudianteId._id,
      [evaluationOnCourse],
      evaluationAssign.evaluationId
    );

    const newUserResult = {
      nombre: evaluationOnCourse.estudianteId.nombre,
      apellido: evaluationOnCourse.estudianteId.apellido,
      rut: evaluationOnCourse.estudianteId.dni,
      aciertoPercentage: results.evaluationList[0].percentage,
      acierto: results.evaluationList[0].answersCorrect,
      score: results.evaluationList[0].score,
      order: evaluationOnCourse.estudianteId.order,
    };

    const porcentaje = results.mainPercentage;
    const index = Math.min(
      Math.floor(porcentaje / 10),
      tableFrecuencia.length - 1
    );

    if (index >= 0 && index < tableFrecuencia.length) {
      tableFrecuencia[index].frecuenciaAbsoluta++;
    }

    if (results.mainPercentage <= 49) {
      estudiantesLogro[2]++;
    } else if (results.mainPercentage <= 84) {
      estudiantesLogro[1]++;
    } else {
      estudiantesLogro[0]++;
    }
    generalScore += results.mainPercentage;
    puntajePromedio += results.evaluationList[0].score;
    tiempoPromedio += results.evaluationList[0].finishTime;
    newUsersResults.push(newUserResult);

    if (userIndex === 0 && !!results.evaluationList.length) {
      userIndex++;
      puntajeTotal = results.evaluationList[0].totalScore;
      await EvaluationOnCourse.populate(evaluationOnCourse, {
        path: "evaluationAssignId",
        model: EvaluationAssign,
        populate: {
          path: "evaluationId",
          model: EvaluationTest,
        },
      });

      questionsLabel = evaluationAssign.evaluationId.questionArr.map(
        (question: { pregunta: string }) => question.pregunta
      );

      questionsCorrect = questionsLabel.map((question) => 0);
      for (let i = 0; i < questionsCorrect.length; i++) {
        questionsCorrect[i] += results.evaluationList[0].progress[i] ? 1 : 0;
      }
    }
  }

  generalScore = Math.round(generalScore / newUsersResults.length) || 0;
  puntajePromedio = Math.round(puntajePromedio / newUsersResults.length) || 0;

  tiempoPromedio = Math.round(tiempoPromedio / newUsersResults.length) || 0;
  // Calcular la frecuencia absoluta acumulada
  tableFrecuencia[0].frecuenciaAbsolutaAcumulada =
    tableFrecuencia[0].frecuenciaAbsoluta;
  for (let i = 1; i < tableFrecuencia.length; i++) {
    tableFrecuencia[i].frecuenciaAbsolutaAcumulada =
      tableFrecuencia[i - 1].frecuenciaAbsolutaAcumulada +
      tableFrecuencia[i].frecuenciaAbsoluta;
  }

  // Calcular la frecuencia relativa y la frecuencia relativa acumulada
  const totalEvaluations = tableFrecuencia.reduce(
    (sum, item) => sum + item.frecuenciaAbsoluta,
    0
  );
  for (let i = 0; i < tableFrecuencia.length; i++) {
    tableFrecuencia[i].frecuenciaRelativa =
      totalEvaluations === 0
        ? 0
        : parseFloat(
            (tableFrecuencia[i].frecuenciaAbsoluta / totalEvaluations).toFixed(
              2
            )
          );
    tableFrecuencia[i].frecuenciaRelativaPercentage = parseFloat(
      (tableFrecuencia[i].frecuenciaRelativa * 100).toFixed(2)
    );
    tableFrecuencia[i].frecuenciaRelativaAcumulada =
      totalEvaluations === 0
        ? 0
        : parseFloat(
            (
              tableFrecuencia[i].frecuenciaAbsolutaAcumulada / totalEvaluations
            ).toFixed(2)
          );
  }

  // Agregar una fila del total
  const totalRow: FrecuenciaItem = {
    acierto: 0,
    frecuenciaAbsoluta: totalEvaluations,
    frecuenciaAbsolutaAcumulada: totalEvaluations,
    frecuenciaRelativa: 1,
    frecuenciaRelativaAcumulada: 1,
    frecuenciaRelativaPercentage: 100,
  };

  // Redondear frecuencias relativas y porcentajes a dos decimales
  tableFrecuencia.forEach((item) => {
    item.frecuenciaRelativa = parseFloat(item.frecuenciaRelativa.toFixed(2));
    item.frecuenciaRelativaAcumulada = parseFloat(
      item.frecuenciaRelativaAcumulada.toFixed(2)
    );
    item.frecuenciaRelativaPercentage = parseFloat(
      item.frecuenciaRelativaPercentage.toFixed(2)
    );
  });

  // Añadir la fila total al array
  tableFrecuencia.push(totalRow);
  const sortedUsers = newUsersResults.sort((a, b) => {
    // Manejar los valores null para que sean considerados mayores que cualquier número
    if (a.order === null) return 1;
    if (b.order === null) return -1;
    return a.order - b.order;
  });

  if (evaluationsOnCourse.length > 0) {
    return NextResponse.json(
      {
        evaluationAssign,
        estudiantesLogro,
        questionsAciertos: {
          labels: questionsLabel,
          aciertos: questionsCorrect.map((acierto) => acierto),
        },
        message: "stats",
        puntajePromedio,
        puntajeTotal,
        generalScore,
        tiempoPromedio,
        newUsersResults: sortedUsers,
        tableFrecuencia,
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      message: "Not found evaluationsOnCourse",
    },
    { status: 404 }
  );
}
