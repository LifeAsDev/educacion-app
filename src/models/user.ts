import { Types } from "mongoose";
import Curso from "@/models/curso";
import Asignatura from "./asignatura";

interface User {
  nombre: string;
  apellido: string;
  password: string;
  rol: string;
  dni: string;
  curso: (Types.ObjectId | Curso | string)[];
  _id: string;
  review?: boolean;
  asignatura?: Asignatura;
  order: number;
}
export default User;
