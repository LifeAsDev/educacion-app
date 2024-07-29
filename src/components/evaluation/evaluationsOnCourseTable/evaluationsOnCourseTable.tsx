"use client";
import { useOnboardingContext } from "@/lib/context";
import styles from "../styles.module.css";
import {
  formatSecondsToMinutes,
  calculateRemainingTime,
  getFinishTime,
} from "@/lib/calculationFunctions";

import { useEffect, useState } from "react";
import Link from "next/link";
import EvaluationAssign from "@/models/evaluationAssign";
interface MonitorArr {
  tiempo: number;
  nombre: string;
  prueba: string;
  state: string;
  progress: number[];
  startTime?: string;
  endTime?: string;
  userId: string;
  pruebaId: string;
  questionCount: number;
  asignatura: string;
}
export type { MonitorArr };

export default function EvaluationsOnCourseTable({
  evaluationAssignId,
}: {
  evaluationAssignId: string;
}) {
  const { session } = useOnboardingContext();
  const [monitorEvaluationArr, setMonitorEvaluationArr] = useState<
    MonitorArr[]
  >([]);
  const [fetchingMonitor, setFetchingMonitor] = useState(true);
  const [evaluationAssign, setEvaluationAssign] = useState<EvaluationAssign>();

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
          setMonitorEvaluationArr(resData.usersMonitor);
          setEvaluationAssign(resData.evaluationAssignFind);
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
    let intervalId: NodeJS.Timeout;

    fetchMonitor();
    intervalId = setInterval(fetchMonitor, 5000);

    // Limpia el intervalo cuando el componente se desmonte
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteEvaluationOnCourseFromUser = async (estudianteId: string) => {
    setFetchingMonitor(true);

    try {
      const res = await fetch(
        `/api/user/${estudianteId}/${evaluationAssignId}/submit`,
        {
          method: "PATCH",
        }
      );

      const resData = await res.json();

      fetchMonitor();
      if (res.ok) {
        return;
      } else {
        return;
      }
    } catch (error) {
      return;
    }
  };

  const finishAssignedEval = () => {
    setEvaluationAssign((prevEvaluationAssign) => {
      if (!prevEvaluationAssign) {
        return prevEvaluationAssign;
      }

      return {
        ...prevEvaluationAssign,
        state: "Completada",
      };
    });
    setFetchingMonitor(true);

    const fetchFinish = async () => {
      try {
        const searchParams = new URLSearchParams();

        const res = await fetch(
          `/api/user/evaluation-assign/${evaluationAssignId}?${searchParams.toString()}`,
          {
            method: "PATCH",
          }
        );

        const resData = await res.json();
        fetchMonitor();
        if (res.ok) {
          return;
        } else {
          return;
        }
      } catch (error) {
        return;
      }
    };
    fetchFinish();
  };
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
                  {evaluationAssign.state !== "Completada" ? (
                    <div
                      onClick={() => {
                        finishAssignedEval();
                      }}
                      className={`${styles.btn} ${styles.complete}`}
                    >
                      Completar
                    </div>
                  ) : evaluationAssign.openQuestionAnswer.length ? (
                    <Link
                      href={`/evaluation/answers/${evaluationAssign._id}`}
                      className={`${styles.btn} ${styles.corregir}`}
                    >
                      Corregir
                    </Link>
                  ) : (
                    <a
                      className={`${styles.btn} ${styles.corregir}`}
                      href={`/evaluation/stats/${evaluationAssign._id}`}
                    >
                      Estadisticas
                    </a>
                  )}
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
              <th>Estado</th>
              <th>Tiempo</th>
            </tr>
          </thead>
          <tbody id="evaluationList" className={styles.tbody}>
            {fetchingMonitor ? (
              <>
                {Array.from({ length: 10 }, (_, index) => (
                  <tr key={index} className={styles.testItem}>
                    <td className={styles.td}></td>
                    <td className={styles.td}></td>
                    <td className={styles.td}></td>
                  </tr>
                ))}
              </>
            ) : (
              monitorEvaluationArr &&
              monitorEvaluationArr.map((item, i) => (
                <tr
                  key={`${item.pruebaId}${item.userId}`}
                  className={styles.testItem}
                >
                  <td className={styles.td}>
                    <div>
                      <p>{item.nombre}</p>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div>
                      {item.state === "En progreso" ||
                      item.state === "Completada" ? (
                        <div className={styles.progressBox}>
                          <p>{item.state}</p>
                          <div className={styles.progressGrid}>
                            {item.progress.map((progressItem, i) => (
                              <div
                                key={i}
                                className={`${styles.progressItem} ${
                                  progressItem === 3
                                    ? styles.empty
                                    : progressItem === 2
                                    ? styles.open
                                    : progressItem === 1
                                    ? styles.correct
                                    : progressItem === 0
                                    ? styles.wrong
                                    : ""
                                }`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p>{item.state}</p>
                      )}
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={`${styles.timeBox}`}>
                      <p>
                        {item.state === "Asignada" ||
                        item.state === "En progreso"
                          ? item.startTime
                            ? formatSecondsToMinutes(
                                calculateRemainingTime(
                                  item.startTime,
                                  item.tiempo || 90
                                )
                              )
                            : formatSecondsToMinutes(
                                item.tiempo * 60 || 90 * 60
                              )
                          : item.state === "Completada" &&
                            formatSecondsToMinutes(
                              getFinishTime(
                                item.startTime!,
                                item.endTime!,
                                item.tiempo || 90
                              )
                            )}
                      </p>
                      {item.state !== "Completada" && (
                        <div
                          onClick={() => {
                            deleteEvaluationOnCourseFromUser(item.userId);
                          }}
                          className={`${styles.btn} ${styles.cancel}`}
                        >
                          Completar
                        </div>
                      )}
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
