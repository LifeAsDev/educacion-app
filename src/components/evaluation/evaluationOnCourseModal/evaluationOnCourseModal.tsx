import { CursoWrap } from "@/components/management/management";
import styles from "../styles.module.css";
import { useState } from "react";
import { useOnboardingContext } from "@/lib/context";

export default function EvaluationOnCourseModal({
  evaluationName,
  evaluationId,
  cancel,
  cursos,
}: {
  evaluationName: string;
  evaluationId: string;
  cancel: () => void;
  cursos: CursoWrap[];
}) {
  const [cursoInput, setCursoInput] = useState("N/A");
  const { session } = useOnboardingContext();
  const [error, setError] = useState(false);
  const assign = () => {
    const fetchSubmit = async () => {
      try {
        const data = new FormData();
        data.set("cursoId", cursoInput as string);
        data.set("evaluationId", evaluationId as string);

        const res = await fetch(`/api/user/evaluations-on-course`, {
          method: "POST",
          body: data,
        });

        return;
      } catch (error) {
        return;
      }
    };
    if (cursoInput !== "N/A") {
      fetchSubmit();
      cancel();
    } else setError(true);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.evalOnCourse}>
        <p>
          Asignar Evaluación <span>{evaluationName}</span>
          <br />
          al Curso
        </p>
        {session ? (
          <>
            <div className={styles.cursoAssignBox}>
              <select
                onFocus={() => setError(false)}
                onChange={(e) => setCursoInput(e.target.value)}
                name="cursoInput"
                id="cursoInput"
                value={cursoInput}
                className={error ? styles.wrong : ""}
              >
                <option value="N/A">Escoja un curso</option>
                {cursos
                  .filter(
                    (curso) =>
                      session.rol === "Admin" ||
                      session.rol === "Directivo" ||
                      session.curso.some(
                        (sessionCurso: { _id: string }) =>
                          sessionCurso._id === curso._id
                      )
                  )
                  .map((curso) => (
                    <option key={curso._id} value={curso._id}>
                      {curso.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className={styles.evalOnCourseOptions}>
              <div
                onClick={cancel}
                className={`${styles.btn} ${styles.cancel}`}
              >
                Cancelar
              </div>
              <div onClick={assign} className={`${styles.btn} ${styles.yes}`}>
                Asignar
              </div>
            </div>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
