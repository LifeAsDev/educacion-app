import Question from "@/models/question";
import { Types } from "mongoose";
import Asignatura from "@/models/asignatura";

interface EvaluationTest {
  name: string;
  type: string;
  difficulty: string;
  questionArr: Question[];
  _id: string;
  asignatura?: string | Types.ObjectId | Asignatura;
  creatorId: string | Types.ObjectId;
}
export default EvaluationTest;
