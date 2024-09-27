"use client";
import styles from "./styles.module.css";
import { useState, useEffect, useRef } from "react";
import EvaluationTest from "@/models/evaluationTest";
import Asignatura from "@/models/asignatura";
import { useOnboardingContext } from "@/lib/context";
import EvaluationOnCourseModal from "@/components/evaluation/evaluationOnCourseModal/evaluationOnCourseModal";
import { CursoWrap } from "@/components/management/management";
import ManageEvaluations from "@/components/evaluation/manageEvaluations/manageEvaluations";
import EvaluationTable from "@/components/evaluation/evaluationTable/evaluationTable";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function Evaluation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  const [assign, setAssign] = useState<null | {
    id: string;
    name: string;
    asignatura: string;
  }>(null);
  const [cursosArr, setCursosArr] = useState<CursoWrap[]>([]);

  const [tabSelected, setTabSelected] = useState("Evaluation");

  useEffect(() => {
    setTabSelected(searchParams.get("tabSelected") ?? "Evaluation");
  }, [searchParams]);

  const handleQueryParam = (query: string, value: string) => {
    setTabSelected(value);
    const params = new URLSearchParams(searchParams);
    if (value && query) {
      params.set(query, value);
    } else {
      params.delete(query);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

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

    const fetchEvaluationsTest = async () => {
      try {
        const data = new FormData();
        const searchParams = new URLSearchParams();

        searchParams.append("keyword", inputSearch);
        searchParams.append("page", page);
        searchParams.append("type", filterType);
        searchParams.append("difficulty", filterDifficulty);
        searchParams.append("asignatura", filterAsignatura);

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
    const fetchEvaluationsAssigned = async () => {
      try {
        const data = new FormData();
        const searchParams = new URLSearchParams();
        searchParams.append("curso", session.curso[0]._id);

        const res = await fetch(
          `/api/user/evaluations-on-course/${
            session._id
          }?${searchParams.toString()}`,
          {
            method: "GET",
          }
        );
        const resData = await res.json();
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
        fetchEvaluationsTest();
      } else {
        fetchEvaluationsAssigned();
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
    const divElement = document.getElementById("evaluationList");
    if (divElement) {
      divElement.scrollTop = 0;
    }

    setFetchingEvaluations(true);

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

  return (
    <main className={styles.main}>
      {assign ? (
        <EvaluationOnCourseModal
          cursos={cursosArr}
          cancel={() => setAssign(null)}
          evaluationName={assign.name}
          evaluationId={assign.id}
          evaluationAsignatura={assign.asignatura}
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
            setTabSelected={handleQueryParam}
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
            cursosArr={cursosArr}
          />
        )
      ) : (
        ""
      )}
    </main>
  );
}
