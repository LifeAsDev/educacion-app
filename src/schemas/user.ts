import User from "@/models/user";
import mongoose, { Schema, Types, models } from "mongoose";

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
    asignatura: {
      type: Schema.Types.ObjectId,
      ref: "Asignatura",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models?.User || mongoose.model("User", userSchema);
