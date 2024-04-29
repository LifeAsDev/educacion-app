import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let page: number = parseInt(searchParams.get("page") || "1", 10);
  const pageSize: number = parseInt(searchParams.get("pageSize") || "25", 10);
  const keyword = searchParams.get("keyword");
  const rol = searchParams.get("filterRolInput");

  await connectMongoDB();

  let aggregatePipeline: any[] = [];

  if (keyword !== "") {
    aggregatePipeline.push({
      $match: {
        $or: [
          { nombre: { $regex: keyword, $options: "i" } },
          { apellido: { $regex: keyword, $options: "i" } },
        ],
      },
    });
  }

  if (rol && rol !== "Todos") {
    aggregatePipeline.push({
      $match: {
        rol: rol,
      },
    });
  }

  aggregatePipeline.push({
    $facet: {
      metadata: [{ $count: "totalCount" }],
      data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
    },
  });

  const allUsers = await User.aggregate(aggregatePipeline);
  if (allUsers.length === 0 || !allUsers[0].metadata[0]) {
    // Si no hay eventos o no se encontró metadata, significa que no hay eventos que coincidan con la búsqueda
    return NextResponse.json(
      {
        totalCount: 0,
        totalPages: 1,
        currentPage: page,
        users: [],
        message: "Not found users",
      },
      { status: 200 }
    );
  }

  const totalCount = allUsers[0].metadata[0].totalCount;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (page > totalPages) {
    // Si la página seleccionada es mayor que el número total de páginas,
    // establece la página en 1 y vuelve a consultar los eventos
    page = 1;
    aggregatePipeline[1].$facet.data = [{ $skip: 0 }, { $limit: pageSize }];
    const updatedusers = await User.aggregate(aggregatePipeline);
    return NextResponse.json(
      {
        totalCount,
        totalPages,
        currentPage: page,
        users: updatedusers[0].data,
        message: "Page does not exist. Showing users from page 1.",
      },
      { status: 200 }
    );
  }

  if (allUsers[0].data.length > 0) {
    return NextResponse.json(
      { totalCount, totalPages, currentPage: page, users: allUsers[0].data },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      {
        totalCount: 0,
        totalPages,
        currentPage: page,
        users: [],
        message: "Not found users",
      },
      { status: 404 }
    );
  }
}
