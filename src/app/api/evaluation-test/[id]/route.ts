import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationTest from "@/schemas/evaluationTest";
import { uploadFile } from "../../save-image/route";
import { getFileTypeFromBuffer } from "../route";
import Question from "@/models/question";
import { deleteFile } from "../../save-image/route";

export async function DELETE(req: Request, { params }: any) {
  const id = params.id;

  try {
    await connectMongoDB();
    const fileDeleted = await deleteFile(id);

    if (fileDeleted) await EvaluationTest.deleteOne({ _id: id });
    return NextResponse.json(
      { message: "Delete successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "error deleting evaluation test",
    });
  }
}

export async function GET(req: Request, { params }: any) {
  const id = params.id;

  try {
    await connectMongoDB();
    const evaluationTest = await EvaluationTest.findById(id);
    if (!evaluationTest) {
      return NextResponse.json(
        { message: "EvaluationTest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ evaluationTest }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      error: error,
    });
  }
}

export async function PATCH(req: Request, { params }: any) {
  const paramId = params.id;
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
        if (question.image && typeof question.image !== "string") {
          clonedQuestion.image = null;
        } // Modificar el clon
        return clonedQuestion; // Devolver el clon modificado
      }
    );

    await connectMongoDB();

    const newEvaluationTest = await EvaluationTest.findByIdAndUpdate(paramId, {
      name: name,
      type,
      difficulty,
      questionArr: questionArrWithoutBuffer,
    });

    const newEvaluationTest2 = await EvaluationTest.findById(paramId);
    /*   console.log("Create ", newEvaluationTest.questionArr);
    console.log("Old ", questionArrWithoutBuffer); */
    if (newEvaluationTest) {
      for (const question of parseQuestionArr) {
        // Llamar a una función asíncrona por cada elemento
        const evaluationIndex = newEvaluationTest2.questionArr.findIndex(
          (questionId: Question) => questionId.id == question.id
        );
        const id = newEvaluationTest2.questionArr[evaluationIndex]._id;
        if (question.image && typeof question.image !== "string") {
          const extension = await getFileTypeFromBuffer(
            question.image as Buffer
          );

          const { imagePath } = await uploadFile(
            question.image as Buffer,
            `${id}.${extension}`,
            newEvaluationTest.id
          );
          newEvaluationTest2.questionArr[evaluationIndex].image = imagePath;
        }
      }
    }
    const deleteQuestion = newEvaluationTest.questionArr.filter(
      (questionFilter: Question) =>
        parseQuestionArr.every((questionNew: Question) => {
          return questionNew.id !== questionFilter.id!;
        })
    );
    for (const question of deleteQuestion) {
      if (question.image) {
        const questionImage = question.image.split("/");
        const fileDeleted = await deleteFile(
          questionImage[0],
          questionImage[1]
        );
      }
    }

    const updatedEvaluationTest = await EvaluationTest.findByIdAndUpdate(
      newEvaluationTest._id,
      { questionArr: newEvaluationTest2.questionArr },
      { new: true }
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
      console.log("crea los link de imagenes de question");
    }
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      success: false,
      error,
    });
  }
}
