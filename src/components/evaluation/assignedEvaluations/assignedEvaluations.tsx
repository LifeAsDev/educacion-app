import { useOnboardingContext } from "@/lib/context";
import styles from "../styles.module.css";
import { useEffect, useState } from "react";
import EvaluationAssign from "@/models/evaluationAssign";
import Asignatura from "@/models/asignatura";
import { CursoWrap } from "@/components/management/management";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import evaluationAssign from "@/schemas/evaluationAssign";

export default function AssignedEvaluations({
  asignaturasArr,
  cursosArr,
}: {
  asignaturasArr: Asignatura[];
  cursosArr: CursoWrap[];
}) {
  const { session } = useOnboardingContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [fetchingAssigns, setFetchingAssigns] = useState(false);
  const [evaluationsAssign, setEvaluationsAssign] = useState<
    EvaluationAssign[]
  >([]);

  const [cursoInput, setCursoInput] = useState("N/A");
  const [filterAsignatura, setFilterAsignatura] = useState("Todas");

  useEffect(() => {
    setCursoInput(searchParams.get("cursoInput") ?? "N/A");
    setFilterAsignatura(searchParams.get("filterAsignatura") ?? "Todas");
  }, [searchParams]);

  const handleQueryParam = (query: string, value: string) => {
    if (query === "cursoInput") {
      setCursoInput(value);
    }
    if (query === "filterAsignatura") {
      setFilterAsignatura(value);
    }
    const params = new URLSearchParams(searchParams);
    if (value && query) {
      params.set(query, value);
    } else {
      params.delete(query);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const fetchEvaluationsAssign = async () => {
      try {
        const searchParams = new URLSearchParams();
        searchParams.append("curso", cursoInput);

        if (session && session.rol === "Profesor")
          searchParams.append("profesorId", session._id);
        else {
          if (filterAsignatura !== "Todas")
            searchParams.append("asignatura", filterAsignatura);
        }

        const res = await fetch(
          `/api/user/evaluation-assign?${searchParams.toString()}`,
          {
            method: "GET",
          }
        );

        const resData = await res.json();

        setFetchingAssigns(false);
        if (res.ok) {
          setEvaluationsAssign(resData.evaluationAssigneds);
          return;
        } else {
          return;
        }
      } catch (error) {
        return;
      }
    };
    if (session && fetchingAssigns) fetchEvaluationsAssign();
  }, [session, fetchingAssigns]);

  useEffect(() => {
    setEvaluationsAssign([]);
    setFetchingAssigns(false);
    if (cursoInput !== "N/A") setFetchingAssigns(true);
  }, [filterAsignatura, cursoInput]);

  useEffect(() => {
    if (evaluationsAssign[0]) console.log(evaluationsAssign[0].state);
  }, [evaluationsAssign]);

  const finishAssignedEval = (evalAssignId: string) => {
    const evalIndex = evaluationsAssign.findIndex(
      (item) => item._id === evalAssignId
    );
    const newEvaluationsAssign = [...evaluationsAssign];
    newEvaluationsAssign[evalIndex].state = "Completada";

    setEvaluationsAssign(newEvaluationsAssign);
    const fetchFinish = async () => {
      try {
        const searchParams = new URLSearchParams();

        const res = await fetch(
          `/api/user/evaluation-assign/${evalAssignId}?${searchParams.toString()}`,
          {
            method: "PATCH",
          }
        );

        const resData = await res.json();

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
    <>
      <div className={styles.top}>
        <div className={`${styles.cursoAssignBox}`}>
          {session && session.rol !== "Profesor" && (
            <>
              <p>Asignatura:</p>
              <select
                onChange={(e) => {
                  handleQueryParam("filterAsignatura", e.target.value);
                }}
                name="asignatura"
                id="asignatura"
                value={filterAsignatura}
              >
                <option value="Todas">Todos</option>
                {asignaturasArr.map((asignatura) => (
                  <option key={asignatura._id} value={asignatura._id}>
                    {asignatura.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <p>Curso:</p>
          <select
            onChange={(e) => {
              handleQueryParam("cursoInput", e.target.value);
            }}
            name="cursoInput"
            id="cursoInput"
            value={cursoInput}
          >
            <option value="N/A">Escoja un curso</option>
            {session &&
              cursosArr
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
      </div>
      <div
        id="evaluationList"
        className={`${fetchingAssigns ? styles.hidden : ""} ${styles.tableBox}`}
      >
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
            {fetchingAssigns ? (
              <>
                {Array.from({ length: 10 }, (_, index) => (
                  <tr key={index} className={styles.testItem}>
                    <td className={styles.td}></td>
                    <td className={styles.td}></td>
                    <td className={styles.td}></td>
                    <td className={styles.td}></td>
                  </tr>
                ))}
              </>
            ) : (
              evaluationsAssign.map((item, i) => (
                <tr key={`${item._id}`} className={styles.testItem}>
                  <td className={styles.td}>
                    <div>
                      <p>{item.curso.name}</p>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div>
                      <p>{item.evaluationId.name}</p>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div>
                      <p>{item.asignatura?.name ?? "N/A"}</p>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div>
                      <p>{item.state}</p>
                      <Link
                        href={`/evaluation/monitor/${item._id}`}
                        className={`${styles.btn} ${styles.monitorear}`}
                      >
                        Monitorear
                      </Link>
                      {item.state !== "Completada" && (
                        <div
                          onClick={() => {
                            finishAssignedEval(item._id);
                          }}
                          className={`${styles.btn} ${styles.complete}`}
                        >
                          Terminar
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {session && session.rol !== "Profesor" && cursoInput === "N/A" && (
          <div className={styles.tableNone}>Escoja un curso</div>
        )}
        {session &&
          (session.rol === "Profesor" ||
            (session.rol !== "Profesor" && cursoInput !== "N/A")) &&
          !fetchingAssigns &&
          evaluationsAssign.length === 0 && (
            <div className={styles.tableNone}>
              Ninguna evaluación encontrada
            </div>
          )}
        {fetchingAssigns ? (
          <div className={styles.overlay}>
            <div className={styles.loader}></div>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
}
