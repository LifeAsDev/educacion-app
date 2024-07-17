import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import EvaluationTest from "@/schemas/evaluationTest";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationResult from "@/models/evaluationResult";
import EvaluationOnCourseModel from "@/models/evaluationOnCourse";
import { connectMongoDB } from "@/lib/mongodb";

export default async function getEvaluationsOnCourse(
  userId: string,
  evaluationsOnCourse?: EvaluationOnCourseModel[]
): Promise<{
  evaluationList: EvaluationResult[];
  mainPercentage: number;
  message: string;
}> {
  const evaluationList: EvaluationResult[] = [];
  await connectMongoDB();

  if (!evaluationsOnCourse) {
    evaluationsOnCourse = await EvaluationOnCourse.find({
      estudianteId: userId,
      state: "Completada",
    });
  }

  await EvaluationOnCourse.populate(evaluationsOnCourse, {
    path: "evaluationAssignId",
    model: EvaluationAssign,
    populate: {
      path: "evaluationId",
      model: EvaluationTest,
    },
  });

  for (const evaluationOnCourse of evaluationsOnCourse) {
    const progress: number[] = [];
    let totalPoints = 0;

    for (const question of evaluationOnCourse.evaluationAssignId.evaluationId
      .questionArr) {
      const points =
        !question.puntos || question.puntos === 0 ? 1 : question.puntos;
      totalPoints += points;

      const answer = evaluationOnCourse.answers.find(
        (answer) => answer.questionId.toString() === question._id!.toString()
      );

      if (question.type === "multiple") {
        progress.push(answer && answer.answer === "a" ? points : 0);
      } else if (question.type === "open") {
        progress.push(
          answer && question.openAnswers?.includes(answer.answer) ? points : 0
        );
      }
    }
    const points = progress.reduce((acc, val) => acc + val, 0);
    const percentage = Math.round((points / totalPoints) * 100) || 0;

    evaluationList.push({
      progress,
      name: evaluationOnCourse.evaluationAssignId!.evaluationId.name,
      _id: evaluationOnCourse._id,
      answersCorrect: progress.reduce(
        (acc, val) => (val > 0 ? acc + 1 : acc),
        0
      ),
      answersCount: progress.length,
      percentage,
      score: points,
      totalScore: totalPoints,
      evaluationStartTime: evaluationOnCourse.startTime,
      evaluationEndTime: evaluationOnCourse.endTime,
    });
  }

  const mainPercentage = Math.round(
    evaluationList.reduce((acc, curr) => acc + curr.percentage, 0) /
      evaluationList.length
  )
    ? Math.round(
        evaluationList.reduce((acc, curr) => acc + curr.percentage, 0) /
          evaluationList.length
      )
    : 0;

  return {
    evaluationList,
    mainPercentage,
    message: evaluationsOnCourse.length
      ? "Success"
      : "Not found evaluationsOnCourse",
  };
}
