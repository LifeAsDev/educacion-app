import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import EvaluationTest from "@/schemas/evaluationTest";
import Question from "@/models/question";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const name: string = data.get("name") as unknown as string;
    const type: string = data.get("type") as unknown as string;
    const difficulty: string = data.get("difficulty") as unknown as string;
    const clase: string = data.get("clase") as unknown as string;
    const grado: string = data.get("grado") as unknown as string;
    const questionArr: string[] = data.getAll(
      "questionArr"
    ) as unknown as string[];
    const parseQuestionArr: Question[] = questionArr.map((question) =>
      JSON.parse(question)
    );
    await connectMongoDB();
    const newEvaluationTest = await EvaluationTest.create({
      name,
      type,
      difficulty,
      clase,
      grado,
      questionArr: parseQuestionArr,
    });

    if (newEvaluationTest) {
      return NextResponse.json(
        {
          message: "the id is " + newEvaluationTest.id,
          id: newEvaluationTest.id,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "error creating evaluation test",
    });
  }
}
export async function GET(req: Request) {
  try {
    await connectMongoDB();
    const evaluationTests = await EvaluationTest.find();
    return NextResponse.json({ evaluationTests }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "error retrieving evaluation tests",
    });
  }
}
