import { Types } from "mongoose";
import User from "@/models/user";
import EvaluationAssign from "@/models/evaluationAssign";

interface Answer {
  questionId: Types.ObjectId;
  answer: string;
}

interface EvaluationOnCourse {
  answers: Answer[];
  startTime?: Date;
  endTime?: Date;
  state: string;
  progress: number[];
  evaluationAssignId: EvaluationAssign;
  estudianteId: User;
  _id: Types.ObjectId;
}
export default EvaluationOnCourse;
export type { Answer, EvaluationOnCourse };
