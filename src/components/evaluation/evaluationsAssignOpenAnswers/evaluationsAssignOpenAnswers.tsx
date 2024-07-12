"use client";
import { useOnboardingContext } from "@/lib/context";
import styles from "../styles.module.css";

import { useEffect, useState } from "react";
import EvaluationAssign from "@/models/evaluationAssign";

export default function EvaluationsAssignOpenAnswers({
  evaluationAssignId,
}: {
  evaluationAssignId: string;
}) {
  const { session } = useOnboardingContext();

  const [fetchingMonitor, setFetchingMonitor] = useState(true);
  const [evaluationAssign, setEvaluationAssign] = useState<EvaluationAssign>();
  const [openQuestionIndexArr, setOpenQuestionIndexArr] = useState<number[]>(
    []
  );

  const fetchMonitor = () => {
    const fetchSubmit = async () => {
      try {
        const searchParams = new URLSearchParams();
        searchParams.append("evaluationAssignId", evaluationAssignId);

        const res = await fetch(
          `/api/user/evaluations-on-course?${searchParams.toString()}`,
          {
            method: "GET",
          }
        );

        const resData = await res.json();
        setFetchingMonitor(false);

        if (res.ok) {
          setEvaluationAssign(resData.evaluationAssignFind);
          setOpenQuestionIndexArr(
            Array(resData.evaluationAssignFind.openQuestionAnswer.length).fill(
              0
            )
          );
          return;
        } else {
          return;
        }
      } catch (error) {
        return;
      }
    };
    fetchSubmit();
  };

  useEffect(() => {
    fetchMonitor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationAssignId]);

  const changeAnswerIndex = (i: number, dir: string, length: number) => {
    if (
      evaluationAssign?.openQuestionAnswer &&
      evaluationAssign?.openQuestionAnswer.length > 0
    ) {
      if (dir === "right") {
        const newOpenQuestionIndexArr = [...openQuestionIndexArr];
        if (newOpenQuestionIndexArr[i] + 1 < length) {
          newOpenQuestionIndexArr[i] = newOpenQuestionIndexArr[i] + 1;
        } else {
          newOpenQuestionIndexArr[i] = 0;
        }
        setOpenQuestionIndexArr(newOpenQuestionIndexArr);
      } else {
        const newOpenQuestionIndexArr = [...openQuestionIndexArr];
        if (newOpenQuestionIndexArr[i] - 1 > -1) {
          newOpenQuestionIndexArr[i] = newOpenQuestionIndexArr[i] - 1;
        } else {
          newOpenQuestionIndexArr[i] = length - 1;
        }

        setOpenQuestionIndexArr(newOpenQuestionIndexArr);
      }
    }
  };

  const setAnswer = (i: number, state: string) => {
    if (
      evaluationAssign?.openQuestionAnswer &&
      evaluationAssign?.openQuestionAnswer.length > 0
    ) {
      const newOpenQuestionAnswer = { ...evaluationAssign };
      const checkAnswer = newOpenQuestionAnswer.openQuestionAnswer[
        i
      ].checkAnswers.splice(openQuestionIndexArr[i], 1);
      const fetchSetAnswer = async (correct: string) => {
        try {
          const searchParams = new URLSearchParams();
          searchParams.append("correct", correct);
          searchParams.append("checkAnswerId", checkAnswer[0]._id as string);

          searchParams.append(
            "estudianteId",
            newOpenQuestionAnswer.openQuestionAnswer[i].estudianteId._id
          );

          const res = await fetch(
            `/api/user/evaluation-assign/${evaluationAssignId}/open-answer?${searchParams.toString()}`,
            {
              method: "PATCH",
            }
          );

          const resData = await res.json();
          setFetchingMonitor(false);

          if (res.ok) {
            return;
          } else {
            return;
          }
        } catch (error) {
          return;
        }
      };

      if (state === "correct") {
        fetchSetAnswer("correct");
      } else {
        fetchSetAnswer("incorrect");
      }

      const newOpenQuestionIndexArr = [...openQuestionIndexArr];
      if (
        newOpenQuestionIndexArr[i] + 1 >
        newOpenQuestionAnswer.openQuestionAnswer[i].checkAnswers.length
      ) {
        newOpenQuestionIndexArr[i] = newOpenQuestionIndexArr[i] - 1;
        setOpenQuestionIndexArr(newOpenQuestionIndexArr);
      }
      if (!newOpenQuestionAnswer.openQuestionAnswer[i].checkAnswers.length) {
        newOpenQuestionAnswer.openQuestionAnswer.splice(i, 1);
      }
      setEvaluationAssign(newOpenQuestionAnswer);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        evaluationAssign?.openQuestionAnswer &&
        evaluationAssign?.openQuestionAnswer.length > 0
      ) {
        const length =
          evaluationAssign?.openQuestionAnswer[0].checkAnswers.length;

        switch (event.key) {
          case "ArrowRight":
            changeAnswerIndex(0, "right", length);
            break;
          case "ArrowLeft":
            changeAnswerIndex(0, "left", length);
            break;
          case "z":
            setAnswer(0, "correct");
            break;
          case "x":
            setAnswer(0, "incorrect");
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationAssign, openQuestionIndexArr]);

  return (
    <main className={styles.main}>
      {!fetchingMonitor && evaluationAssign && (
        <table>
          <thead>
            <tr>
              <th>Curso</th>
              <th>Evaluación</th>
              <th>Asignatura</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody id="evaluationList" className={styles.tbody}>
            <tr
              key={`${evaluationAssign._id}`}
              className={`${styles.evaluationAssignBox} ${styles.testItem}`}
            >
              <td className={styles.td}>
                <div>
                  <p>{evaluationAssign.curso.name}</p>
                </div>
              </td>
              <td className={styles.td}>
                <div>
                  <p>{evaluationAssign.evaluationId.name}</p>
                </div>
              </td>
              <td className={styles.td}>
                <div>
                  <p>{evaluationAssign.asignatura?.name || "N/A"}</p>
                </div>
              </td>
              <td className={styles.td}>
                <div className={`${styles.spaceBetween}`}>
                  <p>{evaluationAssign.state}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <div
        id="evaluationList"
        className={`${fetchingMonitor ? styles.hidden : ""} ${styles.tableBox}`}
      >
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th className={styles.centerText}>Preguntas</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="evaluationList" className={styles.tbody}>
            {fetchingMonitor ? (
              <>
                {Array.from({ length: 15 }, (_, index) => (
                  <tr key={index} className={styles.testItem}>
                    <td className={styles.td}></td>
                    <td className={styles.td}></td>{" "}
                    <td className={styles.td}></td>
                  </tr>
                ))}
              </>
            ) : (
              evaluationAssign?.openQuestionAnswer &&
              openQuestionIndexArr.length > 0 &&
              evaluationAssign?.openQuestionAnswer.map((item, i) => (
                <tr
                  key={`${item._id}`}
                  className={`${styles.testItem} ${styles.openQuestionItem}}`}
                >
                  <td className={styles.td}>
                    <div>
                      <p>{`${item.estudianteId.nombre} ${item.estudianteId.apellido}`}</p>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.answerOutBox}>
                      <div
                        className={styles.openQuestionArrow}
                        onClick={() => {
                          changeAnswerIndex(
                            i,
                            "left",
                            item.checkAnswers.length
                          );
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          id="left-sign"
                          data-name="Flat Color"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="var(--primary-light-blue)"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            <path
                              id="primary"
                              d="M9.13,21.49l-5-9a1,1,0,0,1,0-1l5-9A1,1,0,0,1,10,2h9a1,1,0,0,1,.86.49,1,1,0,0,1,0,1L15.14,12l4.73,8.51A1,1,0,0,1,20,21a1,1,0,0,1-.14.51A1,1,0,0,1,19,22H10A1,1,0,0,1,9.13,21.49Z"
                            ></path>
                          </g>
                        </svg>
                      </div>
                      <div className={styles.openAnswerBox}>
                        <p
                          dangerouslySetInnerHTML={{
                            __html:
                              evaluationAssign.evaluationId.questionArr.find(
                                (item2) =>
                                  item2._id?.toString() ===
                                  item.checkAnswers[
                                    openQuestionIndexArr[i]
                                  ].questionId.toString()
                              )?.pregunta!,
                          }}
                        ></p>
                        <p>
                          {item.checkAnswers[openQuestionIndexArr[i]].answer}
                        </p>
                        <div className={styles.openAnswerPageBox}>
                          {Array.from(
                            { length: item.checkAnswers.length },
                            (_, index) => (
                              <div
                                key={index}
                                className={`${styles.pageItem} ${
                                  openQuestionIndexArr[i] === index &&
                                  styles.selected
                                }`}
                              ></div>
                            )
                          )}
                        </div>
                      </div>
                      <div
                        className={styles.openQuestionArrow}
                        onClick={() =>
                          changeAnswerIndex(
                            i,
                            "right",
                            item.checkAnswers.length
                          )
                        }
                      >
                        <svg
                          className={styles.right}
                          viewBox="0 0 24 24"
                          id="left-sign"
                          data-name="Flat Color"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="var(--primary-light-blue)"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            <path
                              id="primary"
                              d="M9.13,21.49l-5-9a1,1,0,0,1,0-1l5-9A1,1,0,0,1,10,2h9a1,1,0,0,1,.86.49,1,1,0,0,1,0,1L15.14,12l4.73,8.51A1,1,0,0,1,20,21a1,1,0,0,1-.14.51A1,1,0,0,1,19,22H10A1,1,0,0,1,9.13,21.49Z"
                            ></path>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.answerOutBox}>
                      <div
                        onClick={() => {
                          setAnswer(i, "correct");
                        }}
                        className={`${styles.btn} ${styles.correct}`}
                      >
                        Correcto(z)
                      </div>
                      <div
                        onClick={() => {
                          setAnswer(i, "incorrect");
                        }}
                        className={`${styles.btn} ${styles.wrong}`}
                      >
                        Incorrecto(x)
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {fetchingMonitor ? (
          <div className={styles.overlay}>
            <div className={styles.loader}></div>
          </div>
        ) : (
          ""
        )}
      </div>
    </main>
  );
}
