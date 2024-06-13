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

export default function InEvaluation({ id }: { id?: string }) {
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
        const newAnswers: Answers[] = blankAnswers.map((answer, i) => {
          const evaluationIndex = session.evaluationsOnCourse
            ? session.evaluationsOnCourse.findIndex(
                (evaluation: { evaluationId: string }) =>
                  evaluation.evaluationId === id
              )
            : -1;

          const answerIndex =
            evaluationIndex === -1
              ? -1
              : session.evaluationsOnCourse[evaluationIndex].answers.findIndex(
                  (evaluationAnswer: { questionId: string }) =>
                    answer.questionId === evaluationAnswer.questionId
                );

          const newAnswer =
            answerIndex === -1
              ? ""
              : session.evaluationsOnCourse[evaluationIndex].answers[
                  answerIndex
                ].answer;

          return { ...answer, answer: newAnswer };
        });

        setAnswers(newAnswers);
        setEditFetch(false);
      }
    }
  }, [session, asignatura]);

  const cache = useRef(false);

  useEffect(() => {
    if (time === 0) submitEvaluationTest(true);
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
            setAsignatura(data.evaluationTest.asignatura?._id ?? "N/A");
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
  }, [id, router, session]);

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
      data.append("evaluationId", id!);
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
          console.log("yo3");

          router.push(`/evaluation`);

          throw new Error("Failed to fetch evaluation test");
        }
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
          <span>
            {(asignaturasArr.length > 0 &&
              (() => {
                const asignaturaIndex = asignaturasArr.findIndex(
                  (item) => item._id === asignatura
                );
                return asignaturaIndex !== -1 && asignaturasArr[asignaturaIndex]
                  ? asignaturasArr[asignaturaIndex].name
                  : "N/A";
              })()) ||
              "N/A"}
          </span>
        </div>
      </div>
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
                            <span
                              dangerouslySetInnerHTML={{
                                __html: answer.answer,
                              }}
                            ></span>
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
