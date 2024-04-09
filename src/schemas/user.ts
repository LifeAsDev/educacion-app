import User from "@/models/user";
import mongoose, { Schema, models } from "mongoose";

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
    email: {
      type: String,
      required: false,
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
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", userSchema);
