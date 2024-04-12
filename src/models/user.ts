import mongoose from "mongoose";

interface User {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: string;
  dni: string;
  clase: string;
  grado: string;
}
export default User;
