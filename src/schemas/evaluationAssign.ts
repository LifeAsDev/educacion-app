import EvaluationAssign from "@/models/evaluationAssign";
import mongoose, { Schema } from "mongoose";
import OpenQuestionAnswer, { CheckAnswer } from "@/models/openQuestionAnswer";

const CheckAnswerSchema = new Schema<CheckAnswer>({
  questionId: { type: String, required: true },
  answer: { type: String, required: true },
});

const openQuestionAnswerSchema = new Schema<OpenQuestionAnswer>(
  {
    checkAnswers: [CheckAnswerSchema],
    estudianteId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const evaluationAssignSchema = new Schema<EvaluationAssign>(
  {
    evaluationId: { type: Schema.Types.ObjectId, ref: "EvaluationTest" },
    profesorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    curso: {
      type: Schema.Types.ObjectId,
      ref: "Curso",
      required: true,
    },
    asignatura: {
      type: Schema.Types.ObjectId,
      ref: "asignatura",
    },
    openQuestionAnswer: [openQuestionAnswerSchema],
    state: { type: String, default: "Asignada" },
  },
  { timestamps: true }
);

export default mongoose.models?.EvaluationAssign ||
  mongoose.model("EvaluationAssign", evaluationAssignSchema);
