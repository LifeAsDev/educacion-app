import Question from "@/models/question";

interface EvaluationTest {
  name: string;
  type: string;
  difficulty: string;
  clase: string;
  grado: string;
  questionArr: Question[];
  _id: string;
}
export default EvaluationTest;
