import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";
import Curso from "@/schemas/curso";
import { Types } from "mongoose";
import UserResult from "@/models/userResult";
import UserModel from "@/models/user";
import getEvaluationsOnCourse from "@/lib/userStatsFunction";

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
  aggregatePipeline.push(
    {
      $match: {
        review: false,
      },
    },
    {
      $sort: {
        order: 1, // 1 para orden ascendente, -1 para orden descendente
      },
    }
  );

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
  const newUsersResults: UserResult[] = [];
  let generalScore = 0;

  for (const user of users) {
    const results = await getEvaluationsOnCourse(user._id);
    const newUserResult = { user: user as UserModel, results };

    generalScore += results.mainPercentage;
    newUsersResults.push(newUserResult);
  }

  generalScore = Math.round(generalScore / newUsersResults.length) || 0;
  if (users) {
    return NextResponse.json(
      {
        users: newUsersResults,
        generalScore,
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
