import { Types } from "mongoose";
import Curso from "@/models/curso";
import EvaluationTest from "@/models/evaluationTest";
import User from "@/models/user";
import Asignatura from "@/models/asignatura";

interface EvaluationAssign {
  evaluationId: EvaluationTest;
  profesorId: User;
  curso: Curso;
  asignatura: Asignatura;
  state: string;
  _id: string;
}
export default EvaluationAssign;
