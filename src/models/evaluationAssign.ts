import { Types } from "mongoose";

interface EvaluationAssign {
  profesorId: Types.ObjectId;
  curso: Types.ObjectId;
  state: string;
  _id: string;
}
export default EvaluationAssign;
