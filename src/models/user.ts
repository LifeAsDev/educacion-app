import { Types } from "mongoose";
import Curso from "@/models/curso";
import Asignatura from "./asignatura";
interface Answer {
  questionId: Types.ObjectId;
  answer: string;
}

interface EvaluationOnCourse {
  evaluationId: Types.ObjectId;
  answers: Answer[];
  startTime?: Date;
  endTime?: Date;
  state: string;
  progress: number[];
  profesorId?: Types.ObjectId;
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
  asignatura?: Asignatura;
}
export default User;
export type { Answer, EvaluationOnCourse };
