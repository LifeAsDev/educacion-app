import { Types } from "mongoose";
import Curso from "@/models/curso";

interface User {
  nombre: string;
  apellido: string;
  password: string;
  rol: string;
  dni: string;
  curso: (Types.ObjectId | Curso | string)[];
  _id: string;
  review?: boolean;
}
export default User;
