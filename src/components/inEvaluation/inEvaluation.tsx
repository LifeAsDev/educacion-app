"use client";
import styles from "./styles.module.css";
import { useState, useEffect, useRef } from "react";
import Question from "@/models/question";
import { useRouter } from "next/navigation";
import { useOnboardingContext } from "@/lib/context";
import NextImage from "next/image";
import Asignatura from "@/models/asignatura";

interface QuestionWithError extends Question {
  answerArr: any;
  error?: string;
}

const shuffleArray = (array: any) => {
  // Función para mezclar un subarreglo
  const shuffleSubArray = (subArray: any) => {
    const newArray = [...subArray];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  return array.map((item: any) => {
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

  const cache = useRef(false);
  useEffect(() => {
    const cachedState = localStorage.getItem("createState");
    if (cachedState && !cache.current && !id) {
      setEditFetch(false);

      cache.current = true;
      const parseCachedState = JSON.parse(cachedState);
      if (parseCachedState.questionArr) {
        // Convertir los datos de imagen a Buffer si es necesario
        const questionsWithBuffer = parseCachedState.questionArr.map(
          (question: Question) => {
            if (
              typeof question.image !== "string" &&
              question.image !== null &&
              typeof question.image !== "undefined" &&
              "type" in question.image &&
              question.image.type === "Buffer"
            ) {
              return {
                ...question,
                image: Buffer.from(question.image.data),
              };
            }
            return question;
          }
        );

        setQuestionArr(questionsWithBuffer);
      }
      setName(parseCachedState.name);
      setType(parseCachedState.type);
      setDifficulty(parseCachedState.difficulty);
      setAsignatura(parseCachedState.asignatura);
    }
    if (id) {
      cache.current = true;

      setEditFetch(true);
      const fetchEvaluationTest = async (id: string) => {
        try {
          const response = await fetch(`/api/evaluation-test/${id}`, {
            method: "GET",
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error("Failed to fetch evaluation test");
          }
          setName(data.evaluationTest.name);
          setQuestionArr(shuffleArray(data.evaluationTest.questionArr));
          setType(data.evaluationTest.type);
          setDifficulty(data.evaluationTest.difficulty);
          setEditFetch(false);
          setAsignatura(data.evaluationTest.asignatura?._id ?? "N/A");
          return data.evaluationTest;
        } catch (error) {
          router.push(`/evaluation`);
          console.error("Error fetching evaluation test:", error);
          return null;
        }
      };
      fetchEvaluationTest(id);
    }
  }, [id, router]);
  const getIdFromIndex = (index: number) => {
    return String.fromCharCode(97 + index); // 97 is the ASCII code for 'a'
  };
  return (
    <main className={styles.main}>
      {submitting || editFetch ? (
        <div className={styles.submitting}>
          <div className={styles.loader}></div>
          Obteniendo Datos...
        </div>
      ) : (
        ""
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
        {questionArr.map((question, i) =>
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
                className={styles.pregunta}
                dangerouslySetInnerHTML={{ __html: question.pregunta }}
              ></div>
              <textarea placeholder="Respuesta"></textarea>
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
                className={styles.pregunta}
                dangerouslySetInnerHTML={{ __html: question.pregunta }}
              ></div>
              <ul className={styles.multipleQuestionAnswerBox}>
                {question.answerArr.map((answer: any, index: number) => {
                  const id = getIdFromIndex(index);
                  return (
                    <li key={id}>
                      <label htmlFor={id}>
                        <input
                          type="radio"
                          name={`question-${i}`}
                          id={id}
                          value={id}
                        />
                        <span
                          dangerouslySetInnerHTML={{
                            __html: answer,
                          }}
                        ></span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )
        )}
      </div>
      <div
        className={`${styles.createQuestionBtn} ${styles.btn} ${
          submitting ? "cursor-default" : "submitEvaluationTest"
        }`}
      >
        Terminar Evaluación
      </div>
    </main>
  );
}
