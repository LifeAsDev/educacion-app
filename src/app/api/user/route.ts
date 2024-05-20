import { connectMongoDB } from "@/lib/mongodb";
import User from "@/schemas/user";
import { NextResponse } from "next/server";
import UserType from "@/models/user";
import Curso from "@/schemas/curso";
import mongoose, { Types } from "mongoose";
import CursoType from "@/models/curso";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let page: number = parseInt(searchParams.get("page") || "1", 10);
  const pageSize: number = parseInt(searchParams.get("pageSize") || "25", 10);
  const keyword = searchParams.get("keyword");
  const rol = searchParams.get("filterRolInput");
  const review = searchParams.get("review") === "true" ? true : false;
  const cursoId = searchParams.get("cursoId") as string;

  await connectMongoDB();

  let aggregatePipeline: any[] = [];

  if (cursoId && cursoId !== "Todos") {
    aggregatePipeline.push({
      $match: {
        curso: { $elemMatch: { $eq: new mongoose.Types.ObjectId(cursoId) } },
      },
    });
  }

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
  const initialUsers = [...allUsers[0].data];
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

    const updatedUsers = await User.aggregate(aggregatePipeline);

    const populatedUsers = await User.populate(updatedUsers[0].data, {
      path: "curso",
      model: Curso,
    });

    return NextResponse.json(
      {
        totalCount,
        totalPages,
        currentPage: page,
        users: populatedUsers,
        message: "Page does not exist. Showing users from page 1.",
      },
      { status: 200 }
    );
  }

  const populatedUsers = await User.populate(allUsers[0].data, {
    path: "curso",
    model: Curso,
  });

  const usersCursoDelete = populatedUsers.map((user: UserType) => {
    const newUser: UserType = { ...user }; // Create a shallow copy of the user object
    newUser.curso = (user.curso! as CursoType[]).map((curso: CursoType) => {
      return new Types.ObjectId(curso._id); // Convert curso._id to ObjectId
    });
    return newUser;
  });

  for (const updatedUser of usersCursoDelete) {
    // Create a new instance of the User model with the updated user data
    // Save the updated user to the database
    await User.updateOne({ _id: updatedUser._id }, updatedUser); // Update the user document
  }

  if (allUsers[0].data.length > 0) {
    return NextResponse.json(
      {
        totalCount,
        totalPages,
        currentPage: page,
        users: populatedUsers,
        message: "yo?",
      },
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
    const createdUsersPromises = usersData.map(async (userData: string) => {
      const user = JSON.parse(userData);
      // Generar una contraseña aleatoria de longitud 4
      const password = generateRandomString(4);

      const newUser: Omit<UserType, "_id"> = {
        nombre: (user.nombre || "N/A").toString().trim(),
        apellido: (user.apellido || "N/A").toString().trim(),
        rol: (() => {
          const providedRole = (user.rol || "N/A")
            .toString()
            .trim()
            .toLowerCase();
          switch (providedRole) {
            case "estudiante":
            case "profesor":
            case "directivo":
            case "admin":
              return (
                providedRole.charAt(0).toUpperCase() + providedRole.slice(1)
              );
            default:
              return "N/A";
          }
        })(),
        dni: (user.dni || "N/A").toString(),
        curso: (user.curso || "N/A").toString().trim(),
        password,
        review: false, // Inicializar la propiedad review como false
      };

      // Si alguna entrada es "N/A", establecer review como true
      if (
        Object.entries(newUser).some(
          (value) => value[0] !== "curso" && value[1] === "N/A"
        )
      ) {
        newUser.review = true;
      }

      // Buscar cursos en la base de datos
      const cursosName = newUser.curso as unknown as string;
      if (newUser.dni !== "N/A") {
        const isDuplicated = await User.find({ dni: newUser.dni });
        if (isDuplicated && isDuplicated.length > 0) {
          newUser.review = true;
          newUser.dni = `${newUser.dni}(duplicado)`;
        }
      }

      const cursosArr = await Curso.find({
        name: {
          $in: cursosName.split(","),
        },
      });

      if (newUser.rol === "Estudiante") {
        cursosArr.splice(1, cursosArr.length);
        if (cursosArr.length < 0) {
          newUser.review = true;
        }
      }

      if (newUser.rol === "Directivo" || newUser.rol === "Admin") {
        cursosArr.splice(0, cursosArr.length);
      }
      const cursoObjectsId: string[] = cursosArr.map((e: CursoType) => e._id!);

      // Asignar los cursos encontrados al usuario
      newUser.curso = cursoObjectsId;
      return newUser;
    });

    const createdUsers = await Promise.all(createdUsersPromises);

    // Crear usuarios en la base de datos
    const users = await User.create(createdUsers);

    return NextResponse.json({
      users,
      message: "Users created successfully",
    });
  } catch (error) {
    console.error("Error creating users:", error);
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
