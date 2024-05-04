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
      type: String,
    },
    review: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", userSchema);
