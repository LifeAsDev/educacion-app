import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";
import Curso from "@/schemas/curso";
import mongoose, { Types } from "mongoose";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");
  const cursos = searchParams.getAll("cursos");

  await connectMongoDB();

  let aggregatePipeline: any[] = [];
  if (cursos) {
    // Convertir cada ID en ObjectId
    const objectIdCursos = cursos.map((id) => new Types.ObjectId(id));

    aggregatePipeline.push({
      $match: {
        "curso.0": { $in: objectIdCursos },
      },
    });
  }

  aggregatePipeline.push({
    $match: {
      review: false,
    },
  });

  if (keyword !== "") {
    aggregatePipeline.push({
      $match: {
        $or: [
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ["$nombre", " ", "$apellido"] },
                regex: keyword,
                options: "i",
              },
            },
          },
          { dni: { $regex: keyword, $options: "i" } },
        ],
      },
    });
  }

  aggregatePipeline.push({
    $match: {
      rol: "Estudiante",
    },
  });

  const users = await User.aggregate(aggregatePipeline);

  await User.populate(users, {
    path: "curso",
    model: Curso,
  });

  if (users) {
    return NextResponse.json(
      {
        users,
        message: "Users found",
      },
      { status: 200 }
    );
  }
  return NextResponse.json(
    {
      message: "Not found users",
    },
    { status: 200 }
  );
}
