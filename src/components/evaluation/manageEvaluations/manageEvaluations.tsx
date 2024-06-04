import styles from "../styles.module.css";
import SearchInput from "@/components/management/searchInput/searchInput";
import Link from "next/link";
import { useOnboardingContext } from "@/lib/context";
import Asignatura from "@/models/asignatura";
import {
  calculateRemainingTime,
  formatSecondsToMinutes,
  getFinishTime,
} from "@/lib/calculationFunctions";
import { Dispatch, SetStateAction } from "react";
import { CursoWrap } from "@/components/management/management";
import { MonitorArr } from "@/components/evaluation/evaluation";
import EvaluationTest from "@/models/evaluationTest";
import EvaluationTable from "../evaluationTable/evaluationTable";

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
  setCursoInput,
  cursoInput,
  cursosArr,
  fetchingMonitor,
  monitorEvaluationArr,
  setFetchingMonitor,
  fetchMonitor,
}: {
  setTabSelected: Dispatch<SetStateAction<string>>;
  tabSelected: string;
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
    } | null>
  >;
  itemCount: number;
  pageSelected: number;
  setPageSelected: Dispatch<SetStateAction<number>>;
  setCursoInput: Dispatch<SetStateAction<string>>;
  cursoInput: string;
  cursosArr: CursoWrap[];
  fetchingMonitor: boolean;
  monitorEvaluationArr: MonitorArr[];
  setFetchingMonitor: Dispatch<SetStateAction<boolean>>;
  fetchMonitor: () => void;
}) {
  const { session } = useOnboardingContext();

  const deleteEvaluationOnCourseFromUser = async (
    userId: string,
    evaluationId: string
  ) => {
    setFetchingMonitor(true);

    try {
      const res = await fetch(`/api/user/${userId}/${evaluationId}`, {
        method: "PATCH",
      });

      const resData = await res.json();

      fetchMonitor();
      if (res.ok) {
        return;
      } else {
        return;
      }
    } catch (error) {
      return;
    }
  };
  return (
    <>
      <div className={styles.tabsBox}>
        <div
          onClick={() => setTabSelected("Evaluation")}
          className={`${styles.tabBox} ${
            tabSelected === "Evaluation" ? styles.tabSelected : ""
          }`}
        >
          <p>Evaluaciones</p>
        </div>
        <div
          onClick={() => setTabSelected("Monitor")}
          className={`${styles.tabBox} ${
            tabSelected === "Monitor" ? styles.tabSelected : ""
          }`}
        >
          <p>Monitorear evaluaciones</p>
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
        <>
          <div className={styles.top}>
            <div className={`${styles.cursoAssignBox}`}>
              {session && session.rol !== "Profesor" && (
                <>
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
                </>
              )}
              <p>Curso:</p>
              <select
                onChange={(e) => setCursoInput(e.target.value)}
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
            className={`${fetchingMonitor ? styles.hidden : ""} ${
              styles.tableBox
            }`}
          >
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Prueba</th>
                  <th>Estado</th>
                  <th>Tiempo</th>
                </tr>
              </thead>
              <tbody id="evaluationList" className={styles.tbody}>
                {fetchingMonitor ? (
                  <>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.testItem}>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                      <td className={styles.td}></td>
                    </tr>
                  </>
                ) : (
                  cursoInput !== "N/A" &&
                  monitorEvaluationArr &&
                  monitorEvaluationArr
                    .filter((item) => {
                      console.log(item.asignatura, session.asignatura);
                      return (
                        item.asignatura === filterAsignatura ||
                        (session &&
                          session.rol === "Profesor" &&
                          item.asignatura === session.asignatura) ||
                        (session &&
                          session.rol !== "Profesor" &&
                          filterAsignatura === "Todas")
                      );
                    })
                    .map((item, i) => (
                      <tr
                        key={`${item.pruebaId}${item.userId}`}
                        className={styles.testItem}
                      >
                        <td className={styles.td}>
                          <div>
                            <p>{item.nombre}</p>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div>
                            <p>{item.prueba}</p>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div>
                            {item.state === "En progreso" ||
                            item.state === "Completada" ? (
                              <div className={styles.progressBox}>
                                <p>{item.state}</p>
                                <div className={styles.progressGrid}>
                                  {item.progress.map((progressItem, i) => (
                                    <div
                                      key={i}
                                      className={`${styles.progressItem} ${
                                        progressItem === 3
                                          ? styles.empty
                                          : progressItem === 2
                                          ? styles.open
                                          : progressItem === 1
                                          ? styles.correct
                                          : progressItem === 0
                                          ? styles.wrong
                                          : ""
                                      }`}
                                    ></div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p>{item.state}</p>
                            )}
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.timeBox}>
                            <p>
                              {item.state === "Asignada" ||
                              item.state === "En progreso"
                                ? item.startTime
                                  ? formatSecondsToMinutes(
                                      calculateRemainingTime(
                                        item.startTime,
                                        item.tiempo || 90
                                      )
                                    )
                                  : formatSecondsToMinutes(
                                      item.tiempo * 60 || 90 * 60
                                    )
                                : item.state === "Completada" &&
                                  formatSecondsToMinutes(
                                    getFinishTime(
                                      item.startTime!,
                                      item.endTime!,
                                      item.tiempo || 90
                                    )
                                  )}
                            </p>
                            <div
                              onClick={() =>
                                deleteEvaluationOnCourseFromUser(
                                  item.userId,
                                  item.pruebaId
                                )
                              }
                              className={`${styles.btn} ${styles.cancel}`}
                            >
                              Borrar
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
            {cursoInput === "N/A" && (
              <div className={styles.tableNone}>Escoja un curso</div>
            )}

            {fetchingMonitor ? (
              <div className={styles.overlay}>
                <div className={styles.loader}></div>
              </div>
            ) : (
              ""
            )}
          </div>
        </>
      ) : (
        ""
      )}
    </>
  );
}
