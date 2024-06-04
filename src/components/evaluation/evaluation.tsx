"use client";
import styles from "./styles.module.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import EvaluationTest from "@/models/evaluationTest";
import Asignatura from "@/models/asignatura";
import { useOnboardingContext } from "@/lib/context";
import SearchInput from "@/components/management/searchInput/searchInput";
import EvaluationOnCourseModal from "@/components/evaluation/evaluationOnCourseModal/evaluationOnCourseModal";
import { CursoWrap } from "@/components/management/management";
import curso from "@/schemas/curso";
import ManageEvaluations from "@/components/evaluation/manageEvaluations/manageEvaluations";
import EvaluationTable from "@/components/evaluation/evaluationTable/evaluationTable";

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
export default function Evaluation() {
  const { session } = useOnboardingContext();
  const fetchedEvaluations = useRef(false);
  const [pageSelected, setPageSelected] = useState(1);
  const [evaluationDeleteIndex, setEvaluationDeleteIndex] = useState<
    null | number
  >(null);
  const [evaluationArr, setEvaluationArr] = useState<EvaluationTest[]>([]);
  const [inputSearch, setInputSearch] = useState("");
  const [itemCount, setItemCount] = useState(0);
  const [fetchingEvaluations, setFetchingEvaluations] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState("Todos");
  const [filterType, setFilterType] = useState("Todos");
  const [filterAsignatura, setFilterAsignatura] = useState("Todas");
  const [asignaturasArr, setAsignaturasArr] = useState<Asignatura[]>([]);
  const [assign, setAssign] = useState<null | { id: string; name: string }>(
    null
  );
  const [cursosArr, setCursosArr] = useState<CursoWrap[]>([]);
  const [tabSelected, setTabSelected] = useState("Evaluation");
  const [monitorEvaluationArr, setMonitorEvaluationArr] = useState<
    MonitorArr[]
  >([]);
  const [fetchingMonitor, setFetchingMonitor] = useState(false);
  const [cursoInput, setCursoInput] = useState("N/A");

  useEffect(() => {
    const fetchSubmit = async () => {
      try {
        const res = await fetch(`/api/curso`, {
          method: "GET",
        });

        const resData = await res.json();
        if (res.ok) {
          const newCursos = resData.cursos.map((curso: CursoWrap) => {
            return { ...curso, edit: false };
          });
          setCursosArr(newCursos);
          return;
        } else {
          return;
        }
      } catch (error) {
        return;
      }
    };
    fetchSubmit();
  }, []);

  useEffect(() => {
    const fetchAsignaturas = async () => {
      try {
        const res = await fetch(`/api/asignatura`, {
          method: "GET",
        });

        const resData = await res.json();
        if (res.ok) {
          setAsignaturasArr(resData.asignaturas);
          return;
        } else {
          return;
        }
      } catch (error) {
        return;
      }
    };

    if (session && !fetchedEvaluations.current) {
      fetchedEvaluations.current = true;
      search();
      fetchAsignaturas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (session) search();
    // eslint-disable-next-line
  }, [pageSelected]);

  useEffect(() => {
    setPageSelected(0);
  }, [filterAsignatura, filterType, filterDifficulty]);

  const search = () => {
    const divElement = document.getElementById("evaluationList");
    if (divElement) {
      divElement.scrollTop = 0;
    }

    const page = pageSelected.toString();
    setFetchingEvaluations(true);

    const fetchSubmit = async () => {
      try {
        const data = new FormData();
        const searchParams = new URLSearchParams();

        searchParams.append("keyword", inputSearch);
        searchParams.append("page", page);
        searchParams.append("type", filterType);
        searchParams.append("difficulty", filterDifficulty);
        searchParams.append("asignatura", filterAsignatura);
        if (session.rol === "Estudiante") {
          searchParams.append("rol", session.rol);
          searchParams.append("pageSize", "1000");
          session.evaluationsOnCourse.forEach(
            (evaluation: { state: string; evaluationId: string }) => {
              if (evaluation.state !== "Completada")
                searchParams.append("evaluationsId", evaluation.evaluationId);
            }
          );
        }
        const res = await fetch(
          `/api/evaluation-test?${searchParams.toString()}`,
          {
            method: "GET",
          }
        );

        const resData = await res.json();
        setItemCount(resData.totalCount);
        if (res.ok) {
          setFetchingEvaluations(false);
          setEvaluationArr(resData.evaluationTests);
          return;
        } else {
          setFetchingEvaluations(false);

          return;
        }
      } catch (error) {
        setFetchingEvaluations(false);

        return;
      }
    };
    if (pageSelected > 0 && session) {
      if (session.rol !== "Estudiante") {
        fetchSubmit();
      } else if (
        session.evaluationsOnCourse &&
        session.evaluationsOnCourse.length > 0
      ) {
        fetchSubmit();
      } else {
        setFetchingEvaluations(false);
        setPageSelected(1);
      }
    } else {
      setFetchingEvaluations(false);
      setPageSelected(1);
    }
  };

  const deleteEvaluation = async () => {
    const newEvaluationArr = [...evaluationArr];
    const deleteEvaluation = newEvaluationArr.splice(
      evaluationDeleteIndex as number,
      1
    );
    const deleteFetch = async () => {
      try {
        const res = await fetch(
          `/api/evaluation-test/${deleteEvaluation[0]._id}`,
          {
            method: "DELETE",
          }
        );
        setPageSelected(0);
        if (!res.ok) {
          return;
        }
      } catch (error) {
        return;
      }
    };
    deleteFetch();
    setEvaluationDeleteIndex(null);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (
      session &&
      session.rol !== "Estudiante" &&
      tabSelected === "Monitor" &&
      cursoInput !== "N/A"
    ) {
      fetchMonitor();
      intervalId = setInterval(fetchMonitor, 5000);
    }

    // Limpia el intervalo cuando el componente se desmonte
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [session, tabSelected, cursoInput]);

  useEffect(() => {
    if (cursoInput !== "N/A") setFetchingMonitor(true);
  }, [cursoInput]);

  const fetchMonitor = () => {
    const fetchSubmit = async () => {
      try {
        const searchParams = new URLSearchParams();
        searchParams.append("curso", cursoInput);
        if (session && session.rol === "Profesor")
          searchParams.append("profesorId", session._id);

        const res = await fetch(
          `/api/user/evaluations-on-course?${searchParams.toString()}`,
          {
            method: "GET",
          }
        );

        const resData = await res.json();
        setFetchingMonitor(false);
        if (res.ok) {
          setMonitorEvaluationArr(resData.users);
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

  return (
    <main className={styles.main}>
      {assign ? (
        <EvaluationOnCourseModal
          cursos={cursosArr}
          cancel={() => setAssign(null)}
          evaluationName={assign.name}
          evaluationId={assign.id}
        />
      ) : (
        ""
      )}
      {evaluationDeleteIndex !== null ? (
        <div className={styles.deleteEvaluationBox}>
          <div className={styles.deleteEvaluationModal}>
            <p>
              ¿Estás seguro que deseas eliminar
              <br />
              <span>{evaluationArr[evaluationDeleteIndex].name}</span>?
            </p>
            <div className={styles.deleteModalOptionsBox}>
              <div
                onClick={() => setEvaluationDeleteIndex(null)}
                className={styles.modalOption}
              >
                No
              </div>
              <div onClick={deleteEvaluation} className={styles.modalOption}>
                Si
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {session ? (
        session.rol === "Estudiante" ? (
          <EvaluationTable
            fetchingEvaluations={fetchingEvaluations}
            evaluationArr={evaluationArr}
          />
        ) : (
          <ManageEvaluations
            setTabSelected={setTabSelected}
            tabSelected={tabSelected}
            inputSearch={inputSearch}
            setInputSearch={setInputSearch}
            search={search}
            filterDifficulty={filterDifficulty}
            setFilterDifficulty={setFilterDifficulty}
            setFilterAsignatura={setFilterAsignatura}
            filterAsignatura={filterAsignatura}
            filterType={filterType}
            setFilterType={setFilterType}
            asignaturasArr={asignaturasArr}
            fetchingEvaluations={fetchingEvaluations}
            evaluationArr={evaluationArr}
            setEvaluationDeleteIndex={setEvaluationDeleteIndex}
            setAssign={setAssign}
            itemCount={itemCount}
            pageSelected={pageSelected}
            setPageSelected={setPageSelected}
            setCursoInput={setCursoInput}
            cursoInput={cursoInput}
            cursosArr={cursosArr}
            fetchingMonitor={fetchingMonitor}
            monitorEvaluationArr={monitorEvaluationArr}
            setFetchingMonitor={setFetchingMonitor}
            fetchMonitor={fetchMonitor}
          />
        )
      ) : (
        ""
      )}
    </main>
  );
}
