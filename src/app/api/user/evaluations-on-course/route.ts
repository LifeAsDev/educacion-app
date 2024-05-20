import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";
import UserType from "@/models/user";
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
        : [...evaluations, { id: evaluationId, answer: [] }];

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
