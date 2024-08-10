import EvaluationTest from "@/models/evaluationTest";
import mongoose, { Schema, models } from "mongoose";
import Question from "@/models/question";

const questionSchema = new Schema<Question>({
  type: {
    type: String,
    required: true,
  },
  pregunta: {
    type: String,
    required: true,
  },

  correcta: String,
  señuelo1: String,
  señuelo2: String,
  señuelo3: String,
  id: {
    type: String,
    required: true,
  },
  image: { type: String, default: null },
  puntos: { type: Number, default: 0 },
  openAnswers: { type: [String], default: [] },
  fileSelected: Number,
});

const evaluationTestSchema = new Schema<EvaluationTest>(
  {
    name: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      required: false,
    },
    difficulty: {
      type: String,
      required: false,
    },

    asignatura: {
      type: Schema.Types.ObjectId,
      ref: "Asignatura",
      required: false,
    },
    questionArr: {
      type: [questionSchema],
      default: [],
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tiempo: { type: Number, default: 90 },
    nivel: String,
    files: [String],
  },
  { timestamps: true }
);

export default mongoose.models?.EvaluationTest ||
  mongoose.model("EvaluationTest", evaluationTestSchema);
