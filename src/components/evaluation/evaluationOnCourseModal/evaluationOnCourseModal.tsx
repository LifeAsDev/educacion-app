import { CursoWrap } from "@/components/management/management";
import styles from "../styles.module.css";
import { useState, useEffect } from "react";
import { useOnboardingContext } from "@/lib/context";
import Curso from "@/models/curso";

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
  const [curso, setCurso] = useState<Curso[]>([]);

  const assign = () => {
    const fetchSubmit = async () => {
      try {
        const data = new FormData();
        data.set(
          "curso",
          JSON.stringify(curso.map((cursoItem) => cursoItem._id))
        );
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
    if (curso.length !== 0) {
      fetchSubmit();
      cancel();
    } else setError(true);
  };
  const addCursoToUser = (curso: Curso) => {
    setCurso((prev) => [...(prev as CursoWrap[]), curso]);
  };
  useEffect(() => {
    const addCurso = cursos.find((curso) => cursoInput === curso._id);

    if (cursoInput !== "N/A" && addCurso) {
      addCursoToUser(addCurso);
    }
    setCursoInput("N/A");
  }, [cursos, cursoInput]);
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
                value={"N/A"}
                className={error ? styles.wrong : ""}
              >
                <option value="N/A">Escoja un curso</option>
                {cursos
                  .filter(
                    (cursoItem) =>
                      session.rol === "Admin" ||
                      session.rol === "Directivo" ||
                      session.curso.some(
                        (sessionCurso: { _id: string }) =>
                          sessionCurso._id === cursoItem._id
                      )
                  )
                  .filter((cursoItem) => {
                    if (curso.length === 0) return true;
                    return curso.every((cursoItem2) => {
                      return cursoItem2._id !== cursoItem._id;
                    });
                  })
                  .map((curso) => (
                    <option key={curso._id} value={curso._id}>
                      {curso.name}
                    </option>
                  ))}
              </select>
            </div>
            {curso.length > 0 && (
              <div className={styles.cursoBox}>
                {(curso as CursoWrap[]).map((curso, i) => (
                  <div key={curso._id} className={styles.cursoItem}>
                    <div
                      onClick={() =>
                        setCurso((prev) =>
                          (prev as CursoWrap[]).filter(
                            (c) => c._id !== curso._id
                          )
                        )
                      }
                    >
                      {curso.name} <span>Eliminar</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
