import HalfCircleProgress from "./HalfCircleProgress/HalfCircleProgress";
import styles from "./styles.module.css";
export default function EvaluationCursoStats({
  evaluationId,
}: {
  evaluationId: string;
}) {
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
    </main>
  );
}
