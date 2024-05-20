import User from "@/models/user";
import mongoose, { Schema, Types, models } from "mongoose";

interface Answer {
  questionId: Types.ObjectId;
  answer: string;
}

interface EvaluationsOnCourse {
  evaluationId: Types.ObjectId;
  answers: Answer[];
}

const answerSchema = new Schema<Answer>({
  questionId: Schema.Types.ObjectId,
  answer: String,
});

const evaluationsOnCourseSchema = new Schema<EvaluationsOnCourse>({
  evaluationId: { type: Schema.Types.ObjectId, ref: "EvaluationTest" },
  answers: [answerSchema],
});

const userSchema = new Schema<User>(
  {
    nombre: {
      type: String,
      default: "",
    },
    apellido: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      required: true,
      default: "estudiante",
    },
    dni: {
      type: String,
      required: true,
    },
    curso: {
      type: [{ type: Schema.Types.ObjectId, ref: "Curso" }],
      default: [],
    },
    review: {
      type: Boolean,
      default: false,
    },
    evaluationsOnCourse: {
      type: [evaluationsOnCourseSchema],
      default: [],
    },
    yo: { type: String, default: "yto" },
  },
  { timestamps: true }
);

export default mongoose.models?.User || mongoose.model("User", userSchema);
