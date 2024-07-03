import { Types } from "mongoose";

interface EvaluationResult {
  name: string;
  _id: Types.ObjectId;
  answersCorrect: number;
  answersCount: number;
  percentage: number;
}

export default EvaluationResult;
