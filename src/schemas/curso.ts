import Curso from "@/models/curso";
import mongoose, { Schema, models } from "mongoose";

const cursoSchema = new Schema<Curso>(
  {
    name: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models?.Curso || mongoose.model("Curso", cursoSchema);
