import User from "@/models/user";
interface CheckAnswer {
  questionId: string;
  answer: string;
}

interface OpenQuestionAnswer {
  checkAnswers: CheckAnswer[];
  estudianteId: User;
  _id: string;
}
export default OpenQuestionAnswer;
export type { CheckAnswer };
