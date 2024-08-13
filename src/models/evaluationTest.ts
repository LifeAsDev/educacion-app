import Question from "@/models/question";
import { Types } from "mongoose";
import Asignatura from "@/models/asignatura";

export interface FilePDF {
  file: Buffer | string | null | { data: [number]; type: string };
  name: string;
  _id?: string;
}

interface EvaluationTest {
  name: string;
  type: string;
  difficulty: string;
  questionArr: Question[];
  _id: string;
  asignatura?: Asignatura;
  creatorId: string | Types.ObjectId;
  tiempo: number; // minutes
  nivel?: string;
  files: FilePDF[];
}
export default EvaluationTest;
