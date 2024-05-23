import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import EvaluationTest from "@/schemas/evaluationTest";

const blockedPagesWithoutLogin = ["/home", "/create-event", "/event"];
const pagesNotAllowedForEstudiantes = ["/create", "/edit", "/management"];
const pagesNotAllowedForProfesores = ["/management"];

export default async function middleware(req: NextRequest) {
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: !(process.env.SECURE_COOKIE === "false"),
  });

  const auth = req.nextUrl.clone();
  auth.pathname = "/";
  const afterAuth = req.nextUrl.clone();
  const home = req.nextUrl.clone();
  const evaluation = req.nextUrl.clone();
  home.pathname = "/home";
  afterAuth.pathname = "/home";
  evaluation.pathname = "/evaluation";

  const currentUrl = req.nextUrl.pathname;
  if (!session && currentUrl !== "/") {
    return NextResponse.redirect(auth);
  } else if (session) {
    if (currentUrl === "/") {
      return NextResponse.redirect(home);
    }
    if (
      session.rol === "Estudiante" &&
      pagesNotAllowedForEstudiantes.some((page) => currentUrl.startsWith(page))
    ) {
      return NextResponse.redirect(home);
    } else if (session.rol === "Profesor") {
      if (currentUrl.startsWith("/edit")) {
        const urlParam = currentUrl.split("/");
        try {
          const searchParams = new URLSearchParams();
          searchParams.append("userId", session.sub!);

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/evaluation-test/${
              urlParam[2]
            }/check-creatorId?${searchParams.toString()}`,
            {
              method: "GET",
            }
          );
          const resData = await res.json();
          if (resData.ok) {
          } else {
            return NextResponse.redirect(evaluation);
          }
        } catch (error) {
          console.log({ error });
          return NextResponse.redirect(evaluation);
        }
      }

      if (
        pagesNotAllowedForProfesores.some((page) => currentUrl.startsWith(page))
      ) {
        return NextResponse.redirect(home);
      }
    }
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    "/dashboard",
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
