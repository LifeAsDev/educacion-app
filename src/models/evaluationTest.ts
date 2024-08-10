import Question from "@/models/question";
import { Types } from "mongoose";
import Asignatura from "@/models/asignatura";

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
  files: string[];
}
export default EvaluationTest;
