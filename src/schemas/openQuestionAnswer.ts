import OpenQuestionAnswer from "@/models/openQuestionAnswer";
import mongoose, { Schema, models } from "mongoose";

const openQuestionAnswerSchema = new Schema<OpenQuestionAnswer>(
  {
    evaluationId: String,
    questionId: String,
    answer: String,
  },
  { timestamps: true }
);

export default mongoose.models?.OpenQuestionAnswer ||
  mongoose.model("OpenQuestionAnswer", openQuestionAnswerSchema);
