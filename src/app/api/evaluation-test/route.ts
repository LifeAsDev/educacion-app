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
import User from "@/schemas/user";
import { FilePDF } from "@/models/evaluationTest";

export async function POST(req: Request) {
  await connectMongoDB();

  const contentLength = req.headers.get("content-length");

  if (contentLength) {
    console.log(`Request size: ${contentLength} bytes`);
  } else {
    console.log("Content-Length header is missing");
  }
  console.log("check0");
  console.log("check0.1");

  const data = await req.formData();
  console.log("Form data fetched:", Object.fromEntries(data));
  data.forEach((value, key) => console.log(`Key: ${key}, Value: ${value}`));

  const name: string = data.get("name") as unknown as string;
  console.log("Name:", name);

  try {
    const type: string = data.get("type") as unknown as string;
    const nivel: string = data.get("nivel") as unknown as string;
    const difficulty: string = data.get("difficulty") as unknown as string;
    let asignatura: string | undefined = data.get("asignatura")! as string;
    const creatorId: string = data.get("creatorId")! as string;
    console.log("check1");
    const tiempo = parseInt(data.get("time")! as string);
    const questionArr: string[] = data.getAll(
      "questionArr"
    ) as unknown as string[];

    const filesArr: string[] = data.getAll("files") as unknown as string[];

    const parseFilesArr: FilePDF[] = filesArr.map((file) => {
      const newFile: FilePDF = JSON.parse(file);
      if (
        typeof newFile.file !== "string" &&
        newFile.file !== null &&
        typeof newFile.file !== "undefined" &&
        "type" in newFile.file &&
        newFile.file.type === "Buffer"
      ) {
        return {
          ...newFile,
          file: Buffer.from(newFile.file.data),
        };
      }

      return newFile;
    });
    console.log({ check2: true });

    const filesArrWithoutBuffer: FilePDF[] = parseFilesArr.map((file) => {
      const clonedFile = { ...file }; // Clonar el objeto
      if (file.file && typeof file.file !== "string") {
        clonedFile.file = null;
      } // Modificar el clon
      return clonedFile; // Devolver el clon modificado
    });
    console.log("check3");

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
    console.log({ check4: true });

    const questionArrWithoutBuffer: Question[] = parseQuestionArr.map(
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
      console.log({ check7: parseQuestionArr });

      for (const question of parseQuestionArr) {
        console.log({ question });
        // Llamar a una función asíncrona por cada elemento
        const evaluationIndex = newEvaluationTest?.questionArr?.findIndex(
          (questionId: Question) => questionId.id == question.id
        );
        const id = newEvaluationTest.questionArr[evaluationIndex]._id;
        console.log({
          id,
          evaluationIndex,
        });
        if (question.image && typeof question.image !== "string") {
          console.log({ if1: true });
          const extension = await getFileTypeFromBuffer(
            question.image as Buffer
          );
          console.log({ extension });
          if (id && evaluationIndex !== -1) {
            console.log({ if2: true });
            const { imagePath, success, message, error } = await uploadFile(
              question.image as Buffer,
              `${id}.${extension}`,
              newEvaluationTest._id
            );
            console.log({ success, message, error });
            newEvaluationTest.questionArr[evaluationIndex].image = imagePath!;
          }
        }
      }
      let fileIndex = 0;
      for (const file of parseFilesArr) {
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

    console.log({ updatedEvaluationTest });
    if (updatedEvaluationTest) {
      console.log({ questionArr: updatedEvaluationTest.questionArr });
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
