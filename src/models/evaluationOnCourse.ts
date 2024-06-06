import { Types } from "mongoose";

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
  evaluationAssignId?: Types.ObjectId;
}
export type { Answer, EvaluationOnCourse };
