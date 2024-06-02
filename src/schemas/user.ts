import User from "@/models/user";
import mongoose, { Schema, Types, models } from "mongoose";
import { Answer, EvaluationOnCourse } from "@/models/user";

const answerSchema = new Schema<Answer>({
  questionId: Schema.Types.ObjectId,
  answer: String,
});

const evaluationOnCourseSchema = new Schema<EvaluationOnCourse>({
  evaluationId: { type: Schema.Types.ObjectId, ref: "EvaluationTest" },
  answers: [answerSchema],
  startTime: Date,
  endTime: Date,
  state: { type: String, default: "Asignada" },
  progress: { type: [Number], default: [] },
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
      type: [evaluationOnCourseSchema],
      default: [],
    },
    asignatura: {
      type: Schema.Types.ObjectId,
      ref: "Asignatura",
    },
  },
  { timestamps: true }
);

export default mongoose.models?.User || mongoose.model("User", userSchema);
