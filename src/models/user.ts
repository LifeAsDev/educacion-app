import { Types } from "mongoose";
import Curso from "@/models/curso";

interface EvaluationOnCourse {
  id: Types.ObjectId;
  answers: [{ id: Types.ObjectId; answer: String }];
}

interface User {
  nombre: string;
  apellido: string;
  password: string;
  rol: string;
  dni: string;
  curso: (Types.ObjectId | Curso | string)[];
  _id: string;
  review?: boolean;
  evaluationsOnCourse?: EvaluationOnCourse[];
  yo?: string;
}
export default User;
