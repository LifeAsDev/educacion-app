import { Types } from "mongoose";

interface EvaluationAssign {
  evaluationId: Types.ObjectId;
  profesorId: Types.ObjectId;
  curso: Types.ObjectId;
  state: string;
  _id: string;
}
export default EvaluationAssign;
