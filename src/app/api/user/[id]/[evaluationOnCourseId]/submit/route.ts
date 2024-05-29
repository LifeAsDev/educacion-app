import User from "@/schemas/user";
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";

export async function PATCH(req: Request, { params }: any) {
  const userId = params.id;
  const evaluationOnCourseId = params.evaluationOnCourseId;

  await connectMongoDB();
  const patchedUser = await User.findById(userId);

  if (patchedUser) {
    const currentTime = new Date();

    const evaluationIndex = patchedUser.evaluationsOnCourse?.findIndex(
      (evaluation: { evaluationId: { toString: () => any } }) => {
        return (
          evaluation.evaluationId &&
          evaluation.evaluationId.toString() === evaluationOnCourseId
        );
      }
    );

    if (evaluationIndex === -1) {
      return NextResponse.json(
        { error: "User not found or failed to update" },
        { status: 404 }
      );
    } else {
      console.log("user>id>eonCourseid>submit");

      patchedUser.evaluationsOnCourse![evaluationIndex].state = "Completada";
      patchedUser.evaluationsOnCourse![evaluationIndex].endTime = currentTime;
    }
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
