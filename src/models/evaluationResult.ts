import { Types } from "mongoose";

interface EvaluationResult {
  name: string;
  _id: Types.ObjectId;
  answersCorrect: number;
  answersCount: number;
  percentage: number;
  totalScore: number;
  score: number;
  evaluationStartTime?: Date;
  evaluationEndTime?: Date;
  progress: number[];
  finishTime: number;
  asignatura: string;
}

export default EvaluationResult;
