import { Types } from "mongoose";

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
  evaluationAssignId?: Types.ObjectId;
  estudianteId: Types.ObjectId;
}
export type { Answer, EvaluationOnCourse };
