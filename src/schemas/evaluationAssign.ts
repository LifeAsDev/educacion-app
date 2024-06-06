import EvaluationAssign from "@/models/evaluationAssign";
import mongoose, { Schema } from "mongoose";

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
    state: { type: String, default: "Asignada" },
  },
  { timestamps: true }
);

export default mongoose.models?.EvaluationAssign ||
  mongoose.model("EvaluationAssign", evaluationAssignSchema);
