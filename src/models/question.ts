import mongoose from "mongoose";

interface Question {
  type: string;
  pregunta: string;
  correcta?: string;
  señuelo1?: string;
  señuelo2?: string;
  señuelo3?: string;
  id: string;
}
export default Question;
