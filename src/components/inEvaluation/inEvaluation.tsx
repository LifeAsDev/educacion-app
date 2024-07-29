"use client";
import styles from "./styles.module.css";
import { useState, useEffect, useRef } from "react";
import Question from "@/models/question";
import { useRouter } from "next/navigation";
import { useOnboardingContext } from "@/lib/context";
import NextImage from "next/image";
import Asignatura from "@/models/asignatura";
import {
  formatSecondsToMinutes,
  calculateRemainingTime,
} from "@/lib/calculationFunctions";
import Instructions from "./instructions/instructions";

function generateUniqueId(existingIds: Set<string>): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";

  do {
    result = "";
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
  } while (existingIds.has(result));

  return result;
}

interface QuestionWithError extends Question {
  answerArr: { answer: string; id: string; indexId: string }[];
  error?: boolean;
}

interface Answers {
  questionId: string;
  answer: string;
}
const getIdFromIndex = (index: number) => {
  return String.fromCharCode(97 + index); // 97 is the ASCII code for 'a'
};

const shuffleArray = (array: any) => {
  const shuffleArray = (array: any) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };
  const newArray = shuffleArray(array);

  // Función para mezclar un subarreglo
  const shuffleSubArray = (subArray: any) => {
    const existingIds = new Set<string>();

    const newArray = [...subArray].map((sub, i) => {
      const id = generateUniqueId(existingIds);
      existingIds.add(id);

      return {
        answer: sub,
        indexId: getIdFromIndex(i),
        id: id,
      };
    });
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  return newArray.map((item: any) => {
    if (item.type === "multiple") {
      const answerArr = shuffleSubArray([
        item.correcta,
        item.señuelo1,
        item.señuelo2,
        item.señuelo3,
      ]);
      return { ...item, answerArr };
    }
    return item;
  });
};

const useBeforeUnload = (message: string) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [message]);
};

export default function InEvaluation({ id }: { id?: string }) {
  useBeforeUnload(
    "¿Estás seguro de que quieres salir? Tus respuestas seran guardadas"
  );

  const { session } = useOnboardingContext();
  const router = useRouter();
  const [editFetch, setEditFetch] = useState(true);
  const [questionArr, setQuestionArr] = useState<QuestionWithError[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [asignatura, setAsignatura] = useState<string>("");
  const [asignaturasArr, setAsignaturasArr] = useState<Asignatura[]>([]);
  const [answers, setAnswers] = useState<Answers[]>([]);
  const [time, setTime] = useState(-1);
  const [evaluationTime, setEvaluationTime] = useState(90);
  const [startTime, setStartTime] = useState<undefined | string>();
  const [evalOnCourse, setEvalOnCourse] = useState<any>();

  useEffect(() => {
    const fetchAsignaturas = async () => {
      try {
        const response = await fetch(`/api/asignatura`, {
          method: "GET",
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to fetch evaluation test");
        }

        setAsignaturasArr(data.asignaturas);

        return data.asignaturas;
      } catch (error) {
        console.error("Error fetching evaluation test:", error);
        return null;
      }
    };
    fetchAsignaturas();
  }, []);

  useEffect(() => {
    if (session && asignatura !== "") {
      if (answers.length === 0) {
        if (
          evalOnCourse &&
          evalOnCourse.startTime &&
          session.rol === "Estudiante"
        ) {
          setStartTime(evalOnCourse.startTime);
        } else if (session.rol === "Estudiante") {
          setStartTime(new Date().toISOString());
        }
        const blankAnswers = questionArr.map((question, i): Answers => {
          return { questionId: question._id!, answer: "" };
        });
        if (session.rol === "Estudiante") {
          const newAnswers: Answers[] = blankAnswers.map((answer, i) => {
            const answerIndex = evalOnCourse.answers.findIndex(
              (evaluationAnswer: { questionId: string }) =>
                answer.questionId === evaluationAnswer.questionId
            );

            const newAnswer =
              answerIndex === -1
                ? ""
                : evalOnCourse.answers[answerIndex].answer;

            return { ...answer, answer: newAnswer };
          });
          setAnswers(newAnswers);
        }
        setAnswers(blankAnswers);

        setEditFetch(false);
      }
    }
  }, [session, asignatura, evalOnCourse, answers.length, questionArr]);

  const cache = useRef(false);

  useEffect(() => {
    if (time === 0) submitEvaluationTest(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  useEffect(() => {
    if (startTime) {
      const intervalId = setInterval(() => {
        setTime(calculateRemainingTime(startTime, evaluationTime));
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [startTime, evaluationTime]);

  useEffect(() => {
    if (id && !cache.current && asignatura === "" && session) {
      cache.current = true;

      setEditFetch(true);
      const fetchEvaluationTest = async (id: string) => {
        try {
          const searchParams = new URLSearchParams();

          searchParams.append("rol", session.rol);
          searchParams.append("userId", session._id);

          const response = await fetch(
            `/api/user/evaluation-assign/${id}?${searchParams.toString()}`,
            {
              method: "GET",
            }
          );
          const data = await response.json();
          if (response.ok) {
            setName(data.evaluationTest.name);
            const shuffleQuestionArr = shuffleArray(
              data.evaluationTest.questionArr
            );
            setQuestionArr(shuffleQuestionArr);
            setType(data.evaluationTest.type);
            setDifficulty(data.evaluationTest.difficulty);
            setAsignatura(data.evaluationTest.asignatura?.name ?? "N/A");
            setEvaluationTime(data.evaluationTest.tiempo ?? 90);
            if (session.rol === "Estudiante") {
              setEvalOnCourse(data.evalOnCourse);
            }
          } else {
            console.log("yo1");
            router.push(`/evaluation`);
          }
          return data.evaluationTest;
        } catch (error) {
          console.log("yo2");
          router.push(`/evaluation`);
          console.error("Error fetching evaluation test:", error);
          return null;
        }
      };
      fetchEvaluationTest(id);
    }
  }, [id, router, session, asignatura]);

  const handleAnswer = (
    answer: string,
    questionId: string,
    answerType: string = "open"
  ) => {
    clearError();
    const newAnswers = [...answers];
    newAnswers[
      answers.findIndex((answer) => answer.questionId === questionId)
    ].answer = answer;
    setAnswers(newAnswers);
    if (answerType === "multiple") fetchAnswer(answer, questionId);
  };

  const fetchAnswer = async (answer: string, questionId: string) => {
    try {
      const data = new FormData();
      data.append("answer", answer);
      data.append("evaluationAssignId", id!);
      data.append("questionId", questionId);
      data.append("userId", session._id);

      const response = await fetch(`/api/user/evaluations-on-course/answer`, {
        method: "POST",
        body: data,
      });

      const resdata = await response.json();
      if (!response.ok) {
        console.log(resdata.message);
        throw new Error("Failed to fetch evaluation test");
      } else if (resdata.message === "Evaluation done") {
        router.push(`/evaluation`);
      }
      return;
    } catch (error) {
      console.error("Error fetching evaluation test:", error);
      return null;
    }
  };

  const submitEvaluationTest = (finish: boolean = false) => {
    const newQuestionArr = [...questionArr];
    const error = false;
    for (const answer of answers) {
      if (answer.answer === "") {
        const questionIndex = questionArr.findIndex(
          (question) => question._id === answer.questionId
        );

        if (questionIndex !== -1) {
          newQuestionArr[questionIndex].error = true;
          const element = document.getElementById(`${answer.questionId}`);
          if (element) {
            const elementTop =
              element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo(0, elementTop);
          }
        }
        setQuestionArr(newQuestionArr);
        if (!finish) return;
      }
    }
    const fetchSubmit = async () => {
      try {
        const data = new FormData();

        const res = await fetch(`/api/user/${session._id}/${id}/submit`, {
          method: "PATCH",
        });

        const resdata = await res.json();

        if (!res.ok) {
          throw new Error("Failed to fetch evaluation test");
        } else router.push(`/evaluation`);

        return;
      } catch (error) {
        console.error("Error fetching evaluation test:", error);
        return null;
      }
    };
    if ((!error && session && session.rol === "Estudiante") || finish) {
      fetchSubmit();
      setSubmitting(true);
    }
  };

  const clearError = () => {
    const newQuestionArr = [...questionArr];

    // Marcar error como false en todas las preguntas
    newQuestionArr.forEach((question, index) => {
      newQuestionArr[index].error = false;
    });

    setQuestionArr(newQuestionArr);
  };
  return (
    <main className={styles.main}>
      {submitting || editFetch ? (
        <div className={styles.submitting}>
          <div className={styles.loader}></div>
          {submitting
            ? "Terminando..."
            : editFetch
            ? "Obteniendo Datos..."
            : ""}
        </div>
      ) : (
        ""
      )}
      {time === -1 ? (
        ""
      ) : (
        <div className={styles.remainingTime}>
          {formatSecondsToMinutes(time)}
        </div>
      )}
      <h1>{name}</h1>
      <div className={styles.mainTestOptionsBox}>
        <div className={styles.inputBox}>
          <label>Tipo de prueba:</label>
          <span>{type}</span>
        </div>
        <div className={styles.inputBox}>
          <label>Nivel de dificultad:</label>
          <span>{difficulty}</span>
        </div>
        <div className={styles.inputBox}>
          <label>Asignatura: </label>
          <span>{asignatura}</span>
        </div>
      </div>
      <Instructions timeLimit={evaluationTime} />
      <div className={styles.questionBox}>
        {!editFetch &&
          questionArr.map((question, i) =>
            question.type === "open" ? (
              <div
                key={question._id || question.id}
                className={styles.openQuestionBox}
              >
                {typeof question.image === "string" && (
                  <NextImage
                    className="h-full object-contain"
                    src={`/api/get-image?photoName=${question.image}`}
                    alt={`Image of question ${i}`}
                    width={1200} // Agrega el ancho de la imagen
                    height={400} // Agrega la altura de la imagen
                  />
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
                  <NextImage
                    className="h-full object-contain"
                    src={`/api/get-image?photoName=${question.image}`}
                    alt={`Image of question ${i}`}
                    width={1200} // Agrega el ancho de la imagen
                    height={400} // Agrega la altura de la imagen
                  />
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
                                    (answer) =>
                                      answer.questionId === question._id!
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
            )
          )}
      </div>
      {session && session.rol === "Estudiante" && (
        <div
          onClick={() => submitEvaluationTest()}
          className={`${styles.createQuestionBtn} ${styles.btn} ${
            submitting ? "cursor-default" : "submitEvaluationTest"
          }`}
        >
          Terminar Evaluación
        </div>
      )}
    </main>
  );
}
