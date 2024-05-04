interface User {
  nombre: string;
  apellido: string;
  password: string;
  rol: string;
  dni: string;
  curso?: string;
  _id: string;
  revisition?: boolean;
}
export default User;
