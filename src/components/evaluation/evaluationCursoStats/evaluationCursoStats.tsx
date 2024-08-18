"use client";
import { useEffect, useMemo, useState } from "react";
import HalfCircleProgress from "./HalfCircleProgress/HalfCircleProgress";
import styles from "./styles.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import styles2 from "@/components/management/styles.module.css";
import EvaluationAssign from "@/models/evaluationAssign";
import FrecuenciaItem from "@/models/frecuenciaItem";
import { calcularNotaEspecifica } from "@/lib/calculationFunctions";

interface EstudianteTable {
  aciertoPercentage: any;
  score: any;
  nombre: string;
  apellido: string;
  rut: string;
  acierto: number;
  _id: string;
  notaEspecifica?: number;
  order: number;
}

// Register the necessary components and scales with ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const ChartBackground = {
  id: "chartBackground",
  beforeDraw: (chart: any) => {
    const ctx = chart.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 1)"; // Background color of the chart
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

ChartJS.register(ChartBackground);

interface QuestionAciertos {
  labels: string[];
  aciertos: number[];
}

export default function EvaluationCursoStats({
  evaluationId,
}: {
  evaluationId: string;
}) {
  const [questionsAciertos, setQuestionAciertos] = useState<QuestionAciertos>({
    labels: [],
    aciertos: [],
  });
  const [estudiantesLogro, setEstudiantesLogro] = useState<number[]>([0, 0, 0]);
  const [evaluationAssign, setEvaluationAssign] = useState<EvaluationAssign>();
  const [estudiantesArr, setEstudiantesArr] = useState<EstudianteTable[]>([]);
  const [puntaje, setPuntaje] = useState({
    puntajePromedio: 0,
    puntajeTotal: 0,
  });
  const [generalScore, setGeneralScore] = useState(0);
  const [timeGeneral, setTimeGeneral] = useState(0);
  const [tableFrecuencia, setTableFrecuencia] = useState<FrecuenciaItem[]>([]);
  const [sortEstudiantesByRank, setSortEstudiantesByRank] = useState(false);
  const [exigencia, setExigencia] = useState(50);
  useEffect(() => {
    const fetchEvaluationsStats = async () => {
      try {
        const searchParams = new URLSearchParams();
        searchParams.append("curso", "");

        const res = await fetch(
          `/api/stats/${evaluationId}?${searchParams.toString()}`,
          {
            method: "GET",
          }
        );

        const resData = await res.json();

        if (res.ok) {
          setQuestionAciertos(resData.questionsAciertos);
          setEstudiantesLogro(resData.estudiantesLogro);
          setEvaluationAssign(resData.evaluationAssign);
          setPuntaje({
            puntajePromedio: resData.puntajePromedio,
            puntajeTotal: resData.puntajeTotal,
          });
          setGeneralScore(resData.generalScore);
          setTimeGeneral(resData.tiempoPromedio);

          setEstudiantesArr(
            resData.newUsersResults.map((item: EstudianteTable) => {
              return {
                ...item,
                notaEspecifica: calcularNotaEspecifica(item.aciertoPercentage),
              };
            })
          );
          setTableFrecuencia(resData.tableFrecuencia);
          return;
        } else {
          return;
        }
      } catch (error) {
        return;
      }
    };
    fetchEvaluationsStats();
  }, [evaluationId]);

  useEffect(() => {
    setEstudiantesArr((prev) => {
      return prev.map((item) => {
        return {
          ...item,
          notaEspecifica: calcularNotaEspecifica(
            item.aciertoPercentage,
            exigencia / 100
          ),
        };
      });
    });
  }, [exigencia]);
  const data1 = useMemo(() => {
    function removeHtmlTags(input: string): string {
      // Crear un elemento temporal en el DOM
      const tempElement = document.createElement("div");
      // Asignar el contenido de la variable al elemento
      tempElement.innerHTML = input;
      // Obtener solo el texto del elemento, sin HTML
      return tempElement.textContent || tempElement.innerText || "";
    }

    const maxDataValue = questionsAciertos?.aciertos
      ? Math.max(...questionsAciertos.aciertos)
      : 0;

    const maxAxisValue = Math.max(maxDataValue, 5);

    return {
      data: {
        labels: questionsAciertos?.labels.map((label) => removeHtmlTags(label)),
        datasets: [
          {
            label: "Aciertos",
            data: questionsAciertos?.aciertos.map((acierto) => acierto),
            backgroundColor: "#5e76ff",
          },
          {
            label: "Incorrectas",
            data: questionsAciertos?.aciertos.map(
              (acierto, index) => estudiantesArr.length - acierto
            ),
            backgroundColor: "#FF0000",
          },
        ],
      },
      options: {
        indexAxis: "y" as const, // Esto invierte los ejes

        scales: {
          y: {
            beginAtZero: true,
          },
          x: {
            ticks: {
              // forces step size to be 50 units
              stepSize: 1,
            },
            beginAtZero: true,
          },
        },
        maintainAspectRatio: false, // Permite ajustar el ancho y alto del gráfico
      },
    };
  }, [questionsAciertos, estudiantesArr.length]);

  const data2 = useMemo(() => {
    const maxDataValue = estudiantesLogro ? Math.max(...estudiantesLogro) : 0;

    const maxAxisValue = Math.max(maxDataValue, 5);

    return {
      data: {
        labels: ["Logrado", "Medianamente Logrado", "Por Lograr"],
        datasets: [
          {
            label: "",
            data: estudiantesLogro,
            backgroundColor: ["#34eb37", "#5e76ff", "#ff001e"],
          },
        ],
      },
      options: {
        indexAxis: "x" as const, // Esto invierte los ejes

        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              // forces step size to be 50 units
              stepSize: 1,
            },
          },
          x: {
            max: maxAxisValue, // Establece el máximo del eje X en 5
            beginAtZero: true,
          },
        },
        maintainAspectRatio: false, // Permite ajustar el ancho y alto del gráfico
      },
    };
  }, [estudiantesLogro]);

  if (!evaluationAssign)
    return (
      <div className={styles.loadBox}>
        <div className={styles.loader}></div>
      </div>
    );

  return (
    <main className={styles.main}>
      <section className={styles.evaluationTop}>
        <span>Resultados: </span>
        {evaluationAssign.evaluationId.name},{" "}
        {evaluationAssign.asignatura?.name}, {evaluationAssign.curso.name}
      </section>
      <section className={styles.evaluationAssignMainDataBox}>
        <div className={styles.evaluationAssignMainData}>
          <ul>
            <li>
              <span>Profesor:</span>
              {`${evaluationAssign.profesorId.nombre} ${evaluationAssign.profesorId.apellido}`}
            </li>
            <li>
              <span>Tiempo:</span>
              {evaluationAssign.evaluationId.tiempo} Minutos
            </li>
            <li>
              <span>Tipo:</span> {evaluationAssign.evaluationId.type}
            </li>
            <li>
              <span>Dificultad:</span>
              {evaluationAssign.evaluationId.difficulty}
            </li>
            <li>
              <span>Puntaje Promedio:</span>
              {puntaje.puntajePromedio}/{puntaje.puntajeTotal}
            </li>
          </ul>
        </div>
        <HalfCircleProgress progress={generalScore} time={timeGeneral} />
      </section>
      <section className={styles.questionChart}>
        <div
          style={{
            height: questionsAciertos.aciertos.length * 40,
            minHeight: "100px",
          }}
        >
          <h3>Aciertos por pregunta</h3>
          <Bar data={data1.data} options={data1.options} />
        </div>
        <div style={{ height: "300px" }}>
          <h3>Logro general</h3>
          <Bar data={data2.data} options={data2.options} />
        </div>
        <div>
          <div className={styles.topRankedBox}>
            <h3>Tabla de clasificacion</h3>
            <div className={styles.rankedBox}>
              <div className={styles.rankOptionsBox}>
                <p>Ordenar:</p>
                <div className={styles.sortOptions}>
                  <div
                    onClick={() => setSortEstudiantesByRank(true)}
                    className={`${styles.sortOption} ${
                      sortEstudiantesByRank && styles.select
                    }`}
                  >
                    Puntaje
                  </div>
                  <div
                    onClick={() => setSortEstudiantesByRank(false)}
                    className={`${styles.sortOption} ${
                      !sortEstudiantesByRank && styles.select
                    }`}
                  >
                    Estandar
                  </div>
                </div>
              </div>
              <div className={styles.rankOptionsBox}>
                <p>Exigencia:</p>
                <div className={styles.sortOptions}>
                  <div
                    onClick={() => setExigencia(50)}
                    className={`${styles.sortOption} ${
                      exigencia === 50 && styles.select
                    }`}
                  >
                    50%
                  </div>
                  <div
                    onClick={() => setExigencia(60)}
                    className={`${styles.sortOption} ${
                      exigencia === 60 && styles.select
                    }`}
                  >
                    60%
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles2.tableBox} ${styles.borderRadius}`}>
            <table>
              <thead>
                <tr className={styles2.tableHead}>
                  <th className={styles2.tableHeadName}>Nombre</th>
                  <th className={styles2.tableHeadName}>RUT</th>
                  <th className={styles2.tableHeadName}>% Acierto</th>
                  <th className={styles2.tableHeadName}>Acierto</th>
                  <th className={styles2.tableHeadName}>Puntaje</th>
                  <th className={styles2.tableHeadName}>Nota</th>
                </tr>
              </thead>
              <tbody id="usersList" className={`${styles2.usersList}`}>
                {estudiantesArr &&
                  estudiantesArr
                    .slice()
                    .sort((a, b) =>
                      sortEstudiantesByRank
                        ? b.notaEspecifica! - a.notaEspecifica!
                        : a.order - b.order
                    )
                    .map((user, index) => {
                      return (
                        <tr className={`${styles2.userItem}`} key={user.rut}>
                          <td className={styles2.tableItem}>
                            <p className={styles2.name}>
                              {`${index + 1}. ${user.nombre} ${user.apellido}`}
                            </p>
                          </td>
                          <td className={styles2.tableItem}>
                            <p className={styles2.name}>{`${user.rut}`}</p>
                          </td>
                          <td className={styles2.tableItem}>
                            <p
                              className={styles2.name}
                            >{`${user.aciertoPercentage}%`}</p>
                          </td>
                          <td className={styles2.tableItem}>
                            <p
                              className={styles2.name}
                            >{`${user.acierto}/${evaluationAssign.evaluationId.questionArr.length}`}</p>
                          </td>
                          <td className={styles2.tableItem}>
                            <p
                              className={styles2.name}
                            >{`${user.score}/${puntaje.puntajeTotal}`}</p>
                          </td>
                          <td className={styles2.tableItem}>
                            <p
                              className={styles2.name}
                            >{`${user.notaEspecifica}/10`}</p>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3>Tabla de frecuencia</h3>
          <div className={`${styles2.tableBox} ${styles.borderRadius}`}>
            <table>
              <thead>
                <tr className={styles2.tableHead}>
                  <th className={styles2.tableHeadName}>Acierto</th>
                  <th className={styles2.tableHeadName}>Frecuencia absoluta</th>
                  <th className={styles2.tableHeadName}>
                    Frecuencia absoluta acumulada
                  </th>
                  <th className={styles2.tableHeadName}>Frecuencia relativa</th>
                  <th className={styles2.tableHeadName}>
                    Frecuencia relativa acumulada
                  </th>
                  <th className={styles2.tableHeadName}>
                    % De frecuencia relativa
                  </th>
                </tr>
              </thead>
              <tbody id="usersList" className={`${styles2.usersList}`}>
                {tableFrecuencia &&
                  tableFrecuencia.map((itemFrecuencia, index) => {
                    return (
                      <tr key={index} className={`${styles2.userItem}`}>
                        <td className={styles2.tableItem}>
                          <p className={styles2.name}>
                            {itemFrecuencia.acierto === 0
                              ? "Total"
                              : `${itemFrecuencia.acierto}%`}
                          </p>
                        </td>
                        <td className={styles2.tableItem}>
                          <p className={styles2.name}>
                            {itemFrecuencia.frecuenciaAbsoluta}
                          </p>
                        </td>
                        <td className={styles2.tableItem}>
                          <p className={styles2.name}>
                            {itemFrecuencia.frecuenciaAbsolutaAcumulada}
                          </p>
                        </td>
                        <td className={styles2.tableItem}>
                          <p className={styles2.name}>
                            {itemFrecuencia.frecuenciaRelativa}
                          </p>
                        </td>
                        <td className={styles2.tableItem}>
                          <p className={styles2.name}>
                            {itemFrecuencia.frecuenciaRelativaAcumulada}
                          </p>
                        </td>
                        <td className={styles2.tableItem}>
                          <p className={styles2.name}>
                            {itemFrecuencia.frecuenciaRelativaPercentage}%
                          </p>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
