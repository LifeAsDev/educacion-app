import User from "@/schemas/user";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function PATCH(req: Request, { params }: any) {
  const userId = params.id;
  const evaluationOnCourseId = params.evaluationOnCourseId;

  await connectMongoDB();
  console.log({ userId, evaluationOnCourseId });
  const patchedUser = await User.findById(userId);

  if (patchedUser) {
    // Eliminar el objeto del array evaluationsOnCourse
    patchedUser.evaluationsOnCourse = patchedUser.evaluationsOnCourse.filter(
      (evaluation: any) => {
        console.log(evaluation.evaluationId);
        return evaluation.evaluationId.toString() !== evaluationOnCourseId;
      }
    );

    // Guardar el usuario actualizado
    await patchedUser.save();

    return NextResponse.json(
      { message: "User updated", user: patchedUser },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { error: "User not found or failed to update" },
      { status: 404 }
    );
  }
}
