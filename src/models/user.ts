import { Types } from "mongoose";
import Curso from "@/models/curso";
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
  asignatura?: Types.ObjectId;
}
export default User;
export type { Answer, EvaluationOnCourse };
