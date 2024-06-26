import User from "@/models/user";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./styles.module.css";
import Curso from "@/models/curso";

interface EvaluationStats {
  _id: string;
  name: string;
  answersCorrect: number;
  answersCount: number;
  percentage: number;
}

export default function UserStats({
  setUserSelected,
  userSelected,
}: {
  setUserSelected: Dispatch<SetStateAction<User | null>>;
  userSelected: User;
}) {
  const [evaluationsList, setEvaluationList] = useState<EvaluationStats[]>([]);
  const [mainPercentage, setMainPercentage] = useState(0);
  const [fetchingStats, setFetchingStats] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const searchParams = new URLSearchParams();

        const res = await fetch(
          `/api/stats/${userSelected._id}?${searchParams.toString()}`,
          {
            method: "GET",
          }
        );

        const resData = await res.json();
        if (res.ok) {
          setEvaluationList(resData.evaluationList);
          setMainPercentage(resData.mainPercentage);
          setFetchingStats(false);
          return;
        } else {
          return;
        }
      } catch (error) {
        return;
      }
    };
    fetchUserStats();
  }, [userSelected._id]);

  return (
    <div className={styles.overlay}>
      {fetchingStats ? (
        <div className={`${styles.userBox} ${styles.loaderBox}`}>
          <div className={styles.loader}></div>
        </div>
      ) : (
        <div className={styles.userBox}>
          <div className={styles.userMain}>
            <label>
              Nombre:
              <span> {`${userSelected.nombre} ${userSelected.apellido}`}</span>
            </label>
            <label>
              RUT:<span>{userSelected.dni}</span>
            </label>
            <label>
              Curso:
              <span>
                {Array.isArray(userSelected.curso) &&
                userSelected.curso.length > 0
                  ? (userSelected.curso[0] as Curso).name
                  : "N/A"}
              </span>
            </label>
            <label>
              Promedio:
              <span>{mainPercentage}%</span>
            </label>
            <svg
              onClick={() => setUserSelected(null)}
              className={styles.btnClose}
              viewBox="4 4 16.00 16.00"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="#CCCCCC"
                strokeWidth="0.096"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <g
                  id="Page-1"
                  stroke="none"
                  strokeWidth="1"
                  fill="none"
                  fillRule="evenodd"
                >
                  <g id="Close">
                    <rect
                      id="Rectangle"
                      fillRule="nonzero"
                      x="0"
                      y="0"
                      width="48"
                      height="48"
                    ></rect>
                    <line
                      x1="16.9999"
                      y1="7"
                      x2="7.00001"
                      y2="16.9999"
                      id="Path"
                      stroke="#0C0310"
                      strokeWidth="2"
                      strokeLinecap="round"
                    ></line>
                    <line
                      x1="7.00006"
                      y1="7"
                      x2="17"
                      y2="16.9999"
                      id="Path"
                      stroke="#0C0310"
                      strokeWidth="2"
                      strokeLinecap="round"
                    ></line>
                  </g>
                </g>
              </g>
            </svg>
          </div>
          <div className={`${styles.tableBox}`}>
            <table>
              <tbody className={styles.evaluationsBox}>
                {evaluationsList.map((evaluation) => (
                  <tr key={evaluation._id} className={styles.evaluationBox}>
                    <td>{evaluation.name}</td>
                    <td>
                      {evaluation.answersCorrect}/{evaluation.answersCount}
                    </td>
                    <td>{evaluation.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
