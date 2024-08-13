import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import EvaluationTest from "@/schemas/evaluationTest";
import { uploadFile } from "@/lib/functionToFiles";
import { getFileTypeFromBuffer } from "@/lib/functionToFiles";
import Question from "@/models/question";
import { deleteFile } from "@/lib/functionToFiles";
import { Types } from "mongoose";
import asignatura from "@/schemas/asignatura";
import User from "@/schemas/user";
import UserModel from "@/models/user";
import EvaluationAssign from "@/schemas/evaluationAssign";
import EvaluationOnCourse from "@/schemas/evaluationOnCourse";
import { FilePDF } from "@/models/evaluationTest";

export async function DELETE(req: Request, { params }: any) {
  const id = params.id;

  try {
    await connectMongoDB();
    const fileDeleted = await deleteFile(id);

    if (fileDeleted) {
      // Borra el EvaluationTest
      await EvaluationTest.deleteOne({ _id: id });

      // Borra los EvaluationAssign asociados
      const evaluationAssigns = await EvaluationAssign.find({
        evaluationId: id,
      });
      for (const evaluationAssign of evaluationAssigns) {
        await EvaluationOnCourse.deleteMany({
          evaluationAssignId: evaluationAssign._id,
        });
        await EvaluationAssign.deleteOne({ _id: evaluationAssign._id });
      }
    }

    return NextResponse.json(
      { message: "Delete successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      error: "error deleting evaluation test",
    });
  }
}

export async function GET(req: Request, { params }: any) {
  const id = params.id;
  const { searchParams } = new URL(req.url);
  await connectMongoDB();

  const userId = searchParams.get("userId");
  const rol = searchParams.get("rol");

  try {
    const evaluationTest = await EvaluationTest.findById(id).populate({
      path: "asignatura",
      model: asignatura,
    });

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
    let asignatura: string | undefined = data.get("asignatura")! as string;
    const tiempo = parseInt(data.get("time")! as string);
    const nivel = data.get("nivel")! as string;

    const questionArr: string[] = data.getAll(
      "questionArr"
    ) as unknown as string[];
    const filesArr: string[] = data.getAll("files") as unknown as string[];
    const parseFilesArr: FilePDF[] = filesArr.map((file) => {
      const newFile: FilePDF = JSON.parse(file);
      if (
        newFile.file &&
        typeof newFile.file !== "string" &&
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

    const filesArrWithoutBuffer: FilePDF[] = parseFilesArr.map((file) => {
      const clonedFile = { ...file };
      if (file.file && typeof file.file !== "string") {
        clonedFile.file = null;
      }
      return clonedFile;
    });
    const parseQuestionArr: Question[] = questionArr.map((question) => {
      const newQuestion: Question = JSON.parse(question);
      if (
        newQuestion.image &&
        typeof newQuestion.image !== "string" &&
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

    const newEvaluationTest = await EvaluationTest.findByIdAndUpdate(paramId, {
      name: name,
      type,
      difficulty,
      questionArr: questionArrWithoutBuffer,
      asignatura: asignatura ? new Types.ObjectId(asignatura) : null,
      tiempo,
      nivel,
      files: filesArrWithoutBuffer,
    });
    const deleteImageNull = newEvaluationTest.questionArr.filter(
      (questionFilter: Question) =>
        parseQuestionArr.every((questionNew: Question) => {
          if (
            questionNew.id === questionFilter.id! &&
            questionNew.image === null
          ) {
            return true;
          }
        })
    );

    if (deleteImageNull.length > 0) {
      for (const question of deleteImageNull) {
        if (question.image) {
          const questionImage = question.image.split("/");
          const fileDeleted = await deleteFile(
            questionImage[0],
            questionImage[1]
          );
        }
      }
    }

    const newEvaluationTest2 = await EvaluationTest.findById(paramId);

    if (newEvaluationTest) {
      for (const question of parseQuestionArr) {
        // Llamar a una función asíncrona por cada elemento
        const evaluationIndex = newEvaluationTest2.questionArr.findIndex(
          (questionId: Question) => questionId.id == question.id
        );
        const evaluationIndex2 = newEvaluationTest.questionArr.findIndex(
          (questionId: Question) => questionId.id == question.id
        );
        const id = newEvaluationTest2.questionArr[evaluationIndex]._id;
        if (question.image && typeof question.image !== "string") {
          const extension = await getFileTypeFromBuffer(
            question.image as Buffer
          );

          if (
            evaluationIndex2 !== -1 &&
            newEvaluationTest.questionArr[evaluationIndex2].image
          ) {
            const questionImage =
              newEvaluationTest.questionArr[evaluationIndex2].image.split("/");

            const fileDeleted = await deleteFile(
              questionImage[0],
              questionImage[1]
            );
          }

          const { imagePath } = await uploadFile(
            question.image as Buffer,
            `${id}.${extension}`,
            newEvaluationTest.id
          );

          newEvaluationTest2.questionArr[evaluationIndex].image = imagePath;
        }
      }
      let fileIndex = 0;
      for (const file of parseFilesArr) {
        if (file.file && typeof file.file !== "string") {
          const id = newEvaluationTest2.files[fileIndex]._id;

          if (id) {
            const { imagePath } = await uploadFile(
              file.file as Buffer,
              `${id}.${"pdf"}`,
              newEvaluationTest._id
            );
            if (imagePath) newEvaluationTest2.files[fileIndex].file = imagePath;
          }
        }

        fileIndex++;
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
    const deleteFiles = newEvaluationTest.files.filter(
      (fileFilter: FilePDF) =>
        parseFilesArr.length === 0 ||
        parseFilesArr.every((fileNew) => {
          if (fileNew._id?.toString() !== fileFilter._id!.toString()) {
            return true;
          }
        })
    );

    for (const deletedFile of deleteFiles) {
      if (deletedFile.file) {
        const file = deletedFile.file.split("/");
        const fileDeleted = await deleteFile(file[0], file[1]);
      }
    }

    const updatedEvaluationTest = await EvaluationTest.findByIdAndUpdate(
      newEvaluationTest._id,
      {
        questionArr: newEvaluationTest2.questionArr,
        files: newEvaluationTest2.files,
      },
      { new: true }
    );

    if (updatedEvaluationTest) {
      return NextResponse.json(
        {
          message: "the id is " + updatedEvaluationTest.id,
          updatedEvaluationTest,
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
