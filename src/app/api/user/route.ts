import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let page: number = parseInt(searchParams.get("page") || "1", 10);
  const pageSize: number = parseInt(searchParams.get("pageSize") || "25", 10);
  const keyword = searchParams.get("keyword");
  const rol = searchParams.get("filterRolInput");
  const review = searchParams.get("review") === "true" ? true : false;

  await connectMongoDB();

  let aggregatePipeline: any[] = [];
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

  if (rol && rol !== "Todos") {
    aggregatePipeline.push({
      $match: {
        rol: rol,
      },
    });
  }
  if (review) {
    aggregatePipeline.push({
      $match: {
        review: review,
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

function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(req: Request) {
  await connectMongoDB();

  const formData = await req.formData();
  const usersData = formData.getAll("users") as string[];

  try {
    const users = usersData.map((userData: string) => {
      const user = JSON.parse(userData);
      // Generar una contraseña aleatoria de longitud 4
      const password = generateRandomString(4);
      return { ...user, password };
    });
    // Crear usuarios en la base de datos
    console.log(users);

    const createdUsers = await User.create(users);

    if (createdUsers)
      return NextResponse.json({
        users: createdUsers,
        message: "Users created successfully",
      });
    else
      return NextResponse.json(
        { message: "Error creating users" },
        { status: 500 }
      );
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating users" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const usersDeleteId: string[] = searchParams.getAll("users");

  await connectMongoDB();

  try {
    // Eliminar usuarios por IDs
    const deletionResult = await User.deleteMany({
      _id: { $in: usersDeleteId },
    });

    // Verificar si se eliminaron usuarios y devolver respuesta
    if (deletionResult.deletedCount > 0) {
      // Obtener los usuarios actualizados después de la eliminación

      // Devolver respuesta con los usuarios actualizados
      return NextResponse.json({ message: "Users deleted" }, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "No users were deleted" },
        { status: 404 }
      );
    }
  } catch (error) {
    // Manejar cualquier error que pueda ocurrir
    console.error("Error deleting users:", error);
    return NextResponse.json(
      { message: "Error deleting users" },
      { status: 500 }
    );
  }
}
