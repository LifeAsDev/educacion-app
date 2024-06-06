import { Answer, EvaluationOnCourse } from "@/models/evaluationOnCourse";
import mongoose, { Schema } from "mongoose";

const answerSchema = new Schema<Answer>({
  questionId: Schema.Types.ObjectId,
  answer: String,
});

const evaluationOnCourseSchema = new Schema<EvaluationOnCourse>({
  answers: [answerSchema],
  startTime: Date,
  endTime: Date,
  state: { type: String, default: "Asignada" },
  progress: { type: [Number], default: [] },
  evaluationAssignId: {
    type: Schema.Types.ObjectId,
    ref: "EvaluationAssignId",
  },
});

export default mongoose.models?.User ||
  mongoose.model("EvaluationOnCourseSchema", evaluationOnCourseSchema);
