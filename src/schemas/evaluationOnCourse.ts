import { Answer, EvaluationOnCourse } from "@/models/evaluationOnCourse";
import mongoose, { Schema } from "mongoose";

const answerSchema = new Schema<Answer>({
  questionId: Schema.Types.ObjectId,
  answer: String,
});

const evaluationOnCourseSchema = new Schema<EvaluationOnCourse>({
  answers: { type: [answerSchema], default: [] },
  startTime: Date,
  endTime: Date,
  state: { type: String, default: "Asignada" },
  progress: { type: [Number], default: [] },
  evaluationAssignId: {
    type: Schema.Types.ObjectId,
    ref: "EvaluationAssignId",
  },
  estudianteId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.models?.EvaluationOnCourse ||
  mongoose.model("EvaluationOnCourse", evaluationOnCourseSchema);
