import {
  Answers,
  QuestionWithError,
} from "@/components/inEvaluation/inEvaluationV2/inEvaluationV2";
import styles from "./styles.module.css";
import NextImage from "next/image";

export default function ViewQuestion({
  question,
  fetchAnswer,
  handleAnswer,
  answers,
  fileSelected,
}: {
  question: QuestionWithError;
  fetchAnswer: (
    answer: string,
    questionId: string
  ) => Promise<null | undefined>;
  handleAnswer: (
    answer: string,
    questionId: string,
    answerType?: string
  ) => void;
  answers: Answers[];
  fileSelected: number;
}) {
  if (question)
    return (
      <div
        className={`${styles.viewQuestion} ${
          fileSelected < 0 && styles.fullWidth
        }`}
      >
        {question.type === "open" ? (
          <div
            key={question._id || question.id}
            className={styles.openQuestionBox}
          >
            {typeof question.image === "string" && (
              <div className={styles.imageBox}>
                <NextImage
                  src={`/api/get-image?photoName=${question.image}`}
                  alt={`Image of question`}
                  layout="fill" // Ajusta la imagen al tamaño del contenedor
                  objectFit="contain"
                  className="object-cover"
                />
              </div>
            )}
            <div
              id={question._id}
              className={styles.pregunta}
              dangerouslySetInnerHTML={{ __html: question.pregunta }}
            ></div>
            {question.error && (
              <p className={styles.error}>Campo obligatorio</p>
            )}
            <textarea
              spellCheck="false"
              onBlur={(e) => fetchAnswer(e.target.value, question._id!)}
              onChange={(e) => handleAnswer(e.target.value, question._id!)}
              placeholder="Respuesta"
              defaultValue={
                answers[
                  answers.findIndex(
                    (answer) => answer.questionId === question._id!
                  )
                ].answer
              }
            ></textarea>
          </div>
        ) : (
          <div
            key={question._id || question.id}
            className={styles.multipleQuestionBox}
          >
            {typeof question.image === "string" && (
              <div className={styles.imageBox}>
                <NextImage
                  src={`/api/get-image?photoName=${question.image}`}
                  alt={`Image of question`}
                  layout="fill" // Ajusta la imagen al tamaño del contenedor
                  objectFit="contain"
                  className="object-cover"
                />
              </div>
            )}
            <div
              id={question._id}
              className={styles.pregunta}
              dangerouslySetInnerHTML={{ __html: question.pregunta }}
            ></div>
            {question.error && (
              <p className={styles.error}>Campo obligatorio</p>
            )}
            <ul className={styles.multipleQuestionAnswerBox}>
              {question.answerArr.map(
                (
                  answer: { answer: string; id: string; indexId: string },
                  index: number
                ) => {
                  const id = answer.id;
                  const letters = ["A", "B", "C", "D"];
                  return (
                    <li key={`${id}-${question._id}`}>
                      <label htmlFor={`${id}-${question._id}`}>
                        <input
                          type="radio"
                          name={`question-${question._id}`}
                          id={`${id}-${question._id}`}
                          value={id}
                          onChange={(e) =>
                            handleAnswer(
                              answer.indexId,
                              question._id!,
                              "multiple"
                            )
                          }
                          defaultChecked={
                            answers[
                              answers.findIndex(
                                (answer) => answer.questionId === question._id!
                              )
                            ].answer === answer.indexId
                          }
                        />
                        <span>
                          {letters[index]}.{" "}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: answer.answer,
                            }}
                          ></span>
                        </span>
                      </label>
                    </li>
                  );
                }
              )}
            </ul>
          </div>
        )}
      </div>
    );
}
