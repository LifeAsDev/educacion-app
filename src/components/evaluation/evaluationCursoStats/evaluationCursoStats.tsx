"use client";
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

export default function EvaluationCursoStats({
  evaluationId,
}: {
  evaluationId: string;
}) {
  const data = {
    labels: [
      "Pregunta 1",
      "Pregunta 2",
      "Pregunta 3",
      "Pregunta 4",
      "Pregunta 5",
      "Pregunta 6",
    ],
    datasets: [
      {
        label: "Aciertos",
        data: [2, 3, 4, 5, 6, 7],
        backgroundColor: "#5e76ff",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false, // Permite ajustar el ancho y alto del gráfico
  };

  return (
    <main className={styles.main}>
      <section className={styles.evaluationTop}>
        <span>Resultados: </span> Evaluacion B, Historia
      </section>
      <section className={styles.evaluationAssignMainDataBox}>
        <div className={styles.evaluationAssignMainData}>
          <ul>
            <li>
              <span>Profesor:</span>Osvaldo Alveal Mena
            </li>
            <li>
              <span>Tiempo:</span>90 Minutos
            </li>
            <li>
              <span>Curso:</span>3° Medio A
            </li>
            <li>
              <span>Tipo:</span>PAES
            </li>
            <li>
              <span>Dificultad:</span>Facil
            </li>
          </ul>
        </div>
        <HalfCircleProgress progress={55} />
      </section>
      <section className={styles.questionChart} style={{ height: "300px" }}>
        <Bar data={data} options={options} />
      </section>
    </main>
  );
}
