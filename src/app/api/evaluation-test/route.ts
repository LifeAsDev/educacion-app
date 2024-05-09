import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import EvaluationTest from "@/schemas/evaluationTest";
import Question from "@/models/question";
import { uploadFile } from "../save-image/route";

import { fileTypeFromBuffer } from "file-type";

async function getFileTypeFromBuffer(buffer: Buffer) {
  const result = await fileTypeFromBuffer(buffer);
  if (result) {
    return result.ext;
  } else {
    return "unknown";
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const name: string = data.get("name") as unknown as string;
    const type: string = data.get("type") as unknown as string;
    const difficulty: string = data.get("difficulty") as unknown as string;
    const questionArr: string[] = data.getAll(
      "questionArr"
    ) as unknown as string[];

    const parseQuestionArr: Question[] = questionArr.map((question) => {
      const newQuestion: Question = JSON.parse(question);
      if (
        typeof newQuestion.image !== "string" &&
        newQuestion.image !== null &&
        typeof newQuestion.image !== "undefined" &&
        "type" in newQuestion.image &&
        newQuestion.image.type === "Buffer"
      ) {
        return {
          ...newQuestion,
          image: Buffer.from(newQuestion.image.data),
        };
      }
      return newQuestion;
    });

    const questionArrWithoutBuffer: Question[] = parseQuestionArr.map(
      (question) => {
        const clonedQuestion = { ...question }; // Clonar el objeto question
        clonedQuestion.image = null; // Modificar el clon
        return clonedQuestion; // Devolver el clon modificado
      }
    );

    await connectMongoDB();
    const newEvaluationTest = await EvaluationTest.create({
      name,
      type,
      difficulty,
      questionArr: questionArrWithoutBuffer,
    });
    /*   console.log("Create ", newEvaluationTest.questionArr);
    console.log("Old ", questionArrWithoutBuffer); */
    if (newEvaluationTest) {
      let index = 0;
      for (const question of parseQuestionArr) {
        // Llamar a una función asíncrona por cada elemento
        const id = newEvaluationTest.questionArr[index]._id;
        const extension = await getFileTypeFromBuffer(question.image as Buffer);
        if (question.image) {
          newEvaluationTest.questionArr[index].image = await uploadFile(
            question.image as Buffer,
            `${id}.${extension}`,
            newEvaluationTest.id
          );
        }

        index++; // Aumentar el índice en cada iteración
      }
    }
    const updatedEvaluationTest = await EvaluationTest.findByIdAndUpdate(
      newEvaluationTest._id,
      newEvaluationTest
    );
    if (updatedEvaluationTest) {
      return NextResponse.json(
        {
          message: "the id is " + updatedEvaluationTest.id,
          id: updatedEvaluationTest.id,
        },
        { status: 201 }
      );
    } else {
      console.log("fallo con exito");
    }
  } catch (error) {
    console.log("fallo con exito2");

    return NextResponse.json({
      success: false,
      error,
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
