import styles from "../styles.module.css";
import SearchInput from "@/components/management/searchInput/searchInput";
import Link from "next/link";
import { useOnboardingContext } from "@/lib/context";
import Asignatura from "@/models/asignatura";
import { Dispatch, SetStateAction } from "react";
import { CursoWrap } from "@/components/management/management";
import EvaluationTest from "@/models/evaluationTest";
import EvaluationTable from "../evaluationTable/evaluationTable";
import AssignedEvaluations from "../assignedEvaluations/assignedEvaluations";

export default function ManageEvaluations({
  setTabSelected,
  tabSelected,
  inputSearch,
  setInputSearch,
  search,
  filterDifficulty,
  setFilterDifficulty,
  setFilterAsignatura,
  filterAsignatura,
  filterType,
  setFilterType,
  asignaturasArr,
  fetchingEvaluations,
  evaluationArr,
  setEvaluationDeleteIndex,
  setAssign,
  itemCount,
  pageSelected,
  setPageSelected,
  cursosArr,
}: {
  setTabSelected: (query: string, value: string) => void;
  tabSelected: string | null;
  inputSearch: string;
  setInputSearch: Dispatch<SetStateAction<string>>;
  search: () => void;
  filterDifficulty: string;
  setFilterDifficulty: Dispatch<SetStateAction<string>>;
  setFilterAsignatura: Dispatch<SetStateAction<string>>;
  filterAsignatura: string;
  filterType: string;
  setFilterType: Dispatch<SetStateAction<string>>;
  asignaturasArr: Asignatura[];
  fetchingEvaluations: boolean;
  evaluationArr: EvaluationTest[];
  setEvaluationDeleteIndex: Dispatch<SetStateAction<number | null>>;
  setAssign: Dispatch<
    SetStateAction<{
      id: string;
      name: string;
      asignatura: string;
    } | null>
  >;
  itemCount: number;
  pageSelected: number;
  setPageSelected: Dispatch<SetStateAction<number>>;
  cursosArr: CursoWrap[];
}) {
  const { session } = useOnboardingContext();

  return (
    <>
      <div className={styles.tabsBox}>
        <div
          onClick={() => setTabSelected("tabSelected", "Evaluation")}
          className={`${styles.tabBox} ${
            tabSelected === "Evaluation" ? styles.tabSelected : ""
          }`}
        >
          <p>Evaluaciones</p>
        </div>
        <div
          onClick={() => setTabSelected("tabSelected", "Monitor")}
          className={`${styles.tabBox} ${
            tabSelected === "Monitor" ? styles.tabSelected : ""
          }`}
        >
          <p>Evaluaciones Aplicadas</p>
        </div>
        <div
          onClick={() => setTabSelected("tabSelected", "Questions")}
          className={`${styles.tabBox} ${
            tabSelected === "Questions" ? styles.tabSelected : ""
          }`}
        >
          <p>Preguntas Abiertas</p>
        </div>
      </div>
      {tabSelected === "Evaluation" ? (
        <>
          <div className={styles.top}>
            <div className={styles.filterBox}>
              <SearchInput
                input={inputSearch}
                setInput={setInputSearch}
                action={search}
              />
              <div className={styles.filterOption}>
                <p>Dificultad:</p>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className={styles.dropdown}
                  name="dificultad"
                  id="dificultad"
                >
                  <option value="Todos">Todos</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
              <div className={styles.filterOption}>
                <p>Tipo:</p>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={styles.dropdown}
                  name="prueba"
                  id="prueba"
                >
                  <option value="Todos">Todos</option>
                  <option value="Formativa">Formativa</option>
                  <option value="Sumativa">Sumativa</option>
                  <option value="Simce">Simce</option>
                  <option value="PAES">PAES</option>
                </select>
              </div>
              <div className={styles.filterOption}>
                <p>Asignatura:</p>
                <select
                  onChange={(e) => setFilterAsignatura(e.target.value)}
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
              </div>
            </div>
            <Link className={styles.createBtn} href={"/create"}>
              <p>Crear evaluación</p>
              <svg
                width="48px"
                height="48px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 12H16M12 8L12 16"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
          </div>
          <EvaluationTable
            fetchingEvaluations={fetchingEvaluations}
            evaluationArr={evaluationArr}
            setEvaluationDeleteIndex={setEvaluationDeleteIndex}
            setAssign={setAssign}
          />
          <div className={styles.pageBox}>
            {Array.from(
              {
                length: Math.max(Math.ceil(itemCount / 20), 1),
              },
              (_, index) => index + 1
            ).map((page) => (
              <div
                onClick={() => {
                  if (pageSelected !== page) {
                    setPageSelected(page);
                  }
                }}
                className={`${styles.page} ${
                  pageSelected === page ? styles.selected : ""
                }`}
                key={page}
              >
                {page}
              </div>
            ))}
          </div>
        </>
      ) : tabSelected === "Monitor" ? (
        <AssignedEvaluations
          cursosArr={cursosArr}
          asignaturasArr={asignaturasArr}
        />
      ) : (
        ""
      )}
    </>
  );
}
