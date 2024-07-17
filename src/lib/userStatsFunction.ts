import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import EvaluationTest from "@/schemas/evaluationTest";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationResult from "@/models/evaluationResult";
import EvaluationOnCourseModel from "@/models/evaluationOnCourse";
import { connectMongoDB } from "@/lib/mongodb";
import EvaluationTestModel from "@/models/evaluationTest";

export default async function getEvaluationsOnCourse(
  userId: string,
  evaluationsOnCourse?: EvaluationOnCourseModel[],
  evaluationTest?: EvaluationTestModel
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
  if (!evaluationTest) {
    await EvaluationOnCourse.populate(evaluationsOnCourse, {
      path: "evaluationAssignId",
      model: EvaluationAssign,
      populate: {
        path: "evaluationId",
        model: EvaluationTest,
      },
    });
  }

  for (const evaluationOnCourse of evaluationsOnCourse) {
    let evaluationTestLoop;

    if (evaluationTest) {
      evaluationTestLoop = evaluationTest;
    } else {
      evaluationTestLoop = evaluationOnCourse.evaluationAssignId.evaluationId;
    }
    const progress: number[] = [];
    let totalPoints = 0;

    for (const question of evaluationTestLoop.questionArr) {
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
      name: evaluationTestLoop.name,
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
