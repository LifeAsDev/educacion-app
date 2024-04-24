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
    clase: {
      type: String,
      required: false,
    },
    grado: {
      type: String,
      required: false,
    },
    questionArr: {
      type: [questionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default models.EvaluationTest ||
  mongoose.model("EvaluationTest", evaluationTestSchema);
