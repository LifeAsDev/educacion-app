import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import EvaluationTest from "@/schemas/evaluationTest";
import Question from "@/models/question";
import { uploadFile } from "@/lib/functionToFiles";
import { getFileTypeFromBuffer } from "@/lib/functionToFiles";
import mongoose, { Types } from "mongoose";
import Asignatura from "@/schemas/asignatura";
import User from "@/schemas/user";
import { FilePDF } from "@/models/evaluationTest";

export async function POST(req: Request) {
  await connectMongoDB();

  /*   const contentLength = req.headers.get("content-length");

  if (contentLength) {
    console.log(`Request size: ${contentLength} bytes`);
  } else {
    console.log("Content-Length header is missing");
  } */
  console.log("check0");

  const data = await req.formData();

  const name: string = data.get("name") as unknown as string;

  try {
    const type: string = data.get("type") as unknown as string;
    const nivel: string = data.get("nivel") as unknown as string;
    const difficulty: string = data.get("difficulty") as unknown as string;
    let asignatura: string | undefined = data.get("asignatura")! as string;
    const creatorId: string = data.get("creatorId")! as string;
    console.log("check1");
    const tiempo = parseInt(data.get("time")! as string);
    let questionArr = JSON.parse(data.get("questionArr") as string);

    let filesArr: FilePDF[] = JSON.parse(data.get("filesArr") as string);

    const updatedQuestionArr: Question[] = await Promise.all(
      questionArr.map(async (question: any, index: number) => {
        const imageKey = `image-${index}`;
        let image: null | File | string = data.get(imageKey);
        let buffer: Buffer | null | string = null;

        if (typeof image !== "string" && image !== null) {
          const bytes = await (image as File).arrayBuffer();
          buffer = Buffer.from(bytes);
        } else if (image !== "null") {
          buffer = image;
        }
        return {
          ...question,
          image: buffer,
        };
      })
    );

    questionArr = updatedQuestionArr;

    const updatedFilesArr: FilePDF[] = await Promise.all(
      filesArr.map(async (question, index: number) => {
        const fileKey = `file-${index}`;
        let file: null | File | string = data.get(fileKey);
        let buffer: Buffer | null | string = null;
        if (typeof file !== "string" && file !== null) {
          const bytes = await (file as File).arrayBuffer();
          buffer = Buffer.from(bytes);
        } else if (file) {
          buffer = file;
        }
        return {
          ...question,
          file: buffer,
        };
      })
    );

    filesArr = updatedFilesArr;

    console.log({ check2: questionArr });

    const filesArrWithoutBuffer: FilePDF[] = filesArr.map((file) => {
      const clonedFile = { ...file }; // Clonar el objeto
      if (file.file && typeof file.file !== "string") {
        clonedFile.file = null;
      } // Modificar el clon
      return clonedFile; // Devolver el clon modificado
    });
    console.log("check3");

    console.log({ check4: true });

    const questionArrWithoutBuffer: Question[] = updatedQuestionArr.map(
      (question) => {
        const clonedQuestion = { ...question }; // Clonar el objeto question
        if (question.image && typeof question.image !== "string") {
          clonedQuestion.image = null;
        } // Modificar el clon
        return clonedQuestion; // Devolver el clon modificado
      }
    );

    console.log("check5");

    if (asignatura === "N/A") {
      asignatura = undefined;
    }
    console.log("check6");

    const newEvaluationTest = await EvaluationTest.create({
      name,
      type,
      difficulty,
      questionArr: questionArrWithoutBuffer,
      asignatura: asignatura ? new Types.ObjectId(asignatura) : undefined,
      creatorId: new Types.ObjectId(creatorId),
      tiempo,
      nivel,
      files: filesArrWithoutBuffer,
    });

    if (newEvaluationTest) {
      console.log({ check7: true });

      for (const question of questionArr) {
        // Llamar a una función asíncrona por cada elemento
        const evaluationIndex = newEvaluationTest?.questionArr?.findIndex(
          (questionId: Question) => questionId.id == question.id
        );
        const id = newEvaluationTest.questionArr[evaluationIndex]._id;

        if (question.image && typeof question.image !== "string") {
          const extension = await getFileTypeFromBuffer(
            question.image as Buffer
          );
          if (id && evaluationIndex !== -1) {
            const { imagePath, success, message, error } = await uploadFile(
              question.image as Buffer,
              `${id}.${extension}`,
              newEvaluationTest._id
            );
            newEvaluationTest.questionArr[evaluationIndex].image = imagePath!;
          }
        }
      }
      console.log("check7.1", filesArr);
      let fileIndex = 0;
      for (const file of filesArr) {
        const id = newEvaluationTest.files[fileIndex]._id;
        if (id) {
          const { imagePath, success } = await uploadFile(
            file.file as Buffer,
            `${id}.${"pdf"}`,
            newEvaluationTest._id
          );
          if (imagePath) newEvaluationTest.files[fileIndex].file = imagePath;
        }
        fileIndex++;
      }
    }
    console.log("check8");

    const updatedEvaluationTest = await EvaluationTest.findByIdAndUpdate(
      newEvaluationTest._id,
      newEvaluationTest,
      { new: true }
    );
    console.log("check9");

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
    console.log(
      "Caught error:",
      error instanceof Error ? error.message : error
    );

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
  const rol = searchParams.get("rol");

  if (rol && rol === "Estudiante" && evaluationIds.length === 0)
    return NextResponse.json(
      {
        evaluationTests: [],
        totalCount: 0,
      },
      { status: 200 }
    );

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
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { nivel: { $regex: keyword, $options: "i" } },
          ],
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
        model: User,
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
export const dynamic = "force-dynamic";
