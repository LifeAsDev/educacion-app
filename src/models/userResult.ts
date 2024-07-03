import User from "@/models/user";
import EvaluationResult from "@/models/evaluationResult";

interface UserResult {
  user: User;
  results: { mainPercentage: number; evaluationList: EvaluationResult[] };
}

export default UserResult;
