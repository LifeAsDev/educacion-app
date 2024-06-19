import User from "@/models/user";

interface OpenQuestionAnswer {
  questionId: string;
  answer: string;
  estudianteId: User;
  _id: string;
}
export default OpenQuestionAnswer;
