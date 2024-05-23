import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";
import UserType from "@/models/user";
import { MonitorArr } from "@/components/evaluation/evaluation";
import evaluationTest from "@/schemas/evaluationTest";

export async function POST(req: Request) {
  const formData = await req.formData();
  const cursoId = formData.get("cursoId") as string;
  const evaluationId = formData.get("evaluationId") as string;

  try {
    await connectMongoDB();

    const users = await User.find({
      rol: "Estudiante",
      "curso.0": cursoId,
      review: false,
    }).select("nombre apellido evaluationsOnCourse");

    const updatedUsers: any = users.map((user) => {
      const evaluations = user.evaluationsOnCourse || [];

      const evaluationExists = evaluations.some(
        (evaluation: { id: string }) => evaluation.id === evaluationId
      );

      const newEvaluations = evaluationExists
        ? evaluations
        : [...evaluations, { evaluationId: evaluationId, answer: [] }];

      const newUser = {
        _id: user._id,
        evaluationsOnCourse: newEvaluations,
      };

      return newUser;
    });

    for (const updatedUser of updatedUsers) {
      const userInstance = await User.updateOne(
        { _id: updatedUser._id },
        { evaluationsOnCourse: updatedUser.evaluationsOnCourse }
      );
    }

    return NextResponse.json({
      users: updatedUsers,
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const curso: string[] = searchParams.getAll("curso");
  const rol: string = searchParams.get("rol")!;
  try {
    await connectMongoDB();
    const users = await User.find({
      $and: [{ "curso.0": { $in: curso } }, { rol: "Estudiante" }],
    }).populate({
      path: "evaluationsOnCourse.evaluationId",
      model: evaluationTest,
    });
    const usersMonitor: MonitorArr[] = [];
    for (const user of users) {
      for (const evaluationOnCourse of user.evaluationsOnCourse) {
        if (evaluationOnCourse.evaluationId) {
          const userMonitor: MonitorArr = {
            nombre: `${user.nombre} ${user.apellido}`,
            prueba: evaluationOnCourse.evaluationId.name,
            state: evaluationOnCourse.state,
            progress: evaluationOnCourse.progress,
            userId: user._id,
            pruebaId: evaluationOnCourse.evaluationId._id,
          };

          usersMonitor.push(userMonitor);
        }
      }
    }
    return NextResponse.json({
      users: usersMonitor,
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
