import Asignatura from "@/models/asignatura";
import mongoose, { Schema, models } from "mongoose";

const asignaturaSchema = new Schema<Asignatura>(
  {
    name: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models?.Asignatura ||
  mongoose.model("Asignatura", asignaturaSchema);
