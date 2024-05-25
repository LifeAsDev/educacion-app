import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import EvaluationTest from "@/schemas/evaluationTest";
import Question from "@/models/question";
import { uploadFile } from "@/lib/functionToFiles";
import { getFileTypeFromBuffer } from "@/lib/functionToFiles";
import mongoose, { Types } from "mongoose";
export const dynamic = "force-dynamic";
import Asignatura from "@/schemas/asignatura";
import user from "@/schemas/user";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const name: string = data.get("name") as unknown as string;
    const type: string = data.get("type") as unknown as string;
    const difficulty: string = data.get("difficulty") as unknown as string;
    let asignatura: string | undefined = data.get("asignatura")! as string;
    const creatorId: string = data.get("creatorId")! as string;

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
    if (asignatura === "N/A") {
      asignatura = undefined;
    }
    const newEvaluationTest = await EvaluationTest.create({
      name,
      type,
      difficulty,
      questionArr: questionArrWithoutBuffer,
      asignatura: asignatura ? new Types.ObjectId(asignatura) : undefined,
      creatorId: new Types.ObjectId(creatorId),
    });

    /*console.log("Old ", questionArrWithoutBuffer); */
    if (newEvaluationTest) {
      for (const question of parseQuestionArr) {
        // Llamar a una función asíncrona por cada elemento
        const evaluationIndex = newEvaluationTest?.questionArr?.findIndex(
          (questionId: Question) => questionId.id == question.id
        );
        const id = newEvaluationTest.questionArr[evaluationIndex]._id;
        if (question.image && typeof question.image !== "string") {
          const extension = await getFileTypeFromBuffer(
            question.image as Buffer
          );

          const { imagePath } = await uploadFile(
            question.image as Buffer,
            `${id}.${extension}`,
            newEvaluationTest._id
          );
          newEvaluationTest.questionArr[evaluationIndex].image = imagePath!;
        }
      }
    }
    const updatedEvaluationTest = await EvaluationTest.findByIdAndUpdate(
      newEvaluationTest._id,
      newEvaluationTest,
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
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let page: number = parseInt(searchParams.get("page") || "1", 10);
  const pageSize: number = parseInt(searchParams.get("pageSize") || "20", 10);
  const keyword = searchParams.get("keyword");
  const type = searchParams.get("type");
  const difficulty = searchParams.get("difficulty");
  const asignatura = searchParams.get("asignatura") as string;
  const evaluationIds = searchParams.getAll("evaluationsId");

  try {
    await connectMongoDB();
    let aggregatePipeline: any[] = [];
    if (evaluationIds.length > 0) {
      aggregatePipeline.push({
        $match: {
          _id: {
            $in: evaluationIds
              .filter((id) => mongoose.Types.ObjectId.isValid(id))
              .map((id) => {
                return new mongoose.Types.ObjectId(id);
              }),
          },
        },
      });
    }
    if (keyword !== "") {
      aggregatePipeline.push({
        $match: {
          name: { $regex: keyword, $options: "i" },
        },
      });
    }
    if (asignatura !== "Todas") {
      aggregatePipeline.push({
        $match: {
          asignatura: new Types.ObjectId(asignatura),
        },
      });
    }
    if (difficulty !== "Todos") {
      aggregatePipeline.push({
        $match: {
          difficulty: difficulty,
        },
      });
    }
    if (type !== "Todos") {
      aggregatePipeline.push({
        $match: {
          type: type,
        },
      });
    }

    aggregatePipeline.push(
      {
        $project: {
          questionArr: 0,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
        },
      }
    );

    const evaluationAggregate = await EvaluationTest.aggregate(
      aggregatePipeline
    );

    const evaluationTests = await EvaluationTest.populate(
      evaluationAggregate[0].data,
      {
        path: "asignatura",
        model: Asignatura,
      }
    );
    const evaluationPopulateCreatorId = await EvaluationTest.populate(
      evaluationTests,
      {
        path: "creatorId",
        select: "nombre apellido",
        model: user,
      }
    );
    return NextResponse.json(
      {
        evaluationTests,
        totalCount: evaluationAggregate[0]?.metadata[0]?.totalCount ?? 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: "error retrieving evaluation tests",
      },
      { status: 400 }
    );
  }
}
