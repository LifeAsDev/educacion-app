"use client";
import styles from "@/components/management/styles.module.css";
import SearchInput from "@/components/management/searchInput/searchInput";
import User from "@/models/user";
import Curso from "@/models/curso";
import { useEffect, useState } from "react";
import { CursoWrap } from "@/components/management/management";
import { useOnboardingContext } from "@/lib/context";

export default function Stats() {
  const [keyword, setKeyword] = useState("");
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [usersArr, setUsersArr] = useState<User[]>([]);
  const [filterCursoInput, setFilterCursoInput] = useState("N/A");
  const [cursosArr, setCursosArr] = useState<CursoWrap[]>([]);
  const [inputSearch, setInputSearch] = useState("");
  const { session } = useOnboardingContext();

  useEffect(() => {
    if (session && session.rol === "Profesor") {
      setFilterCursoInput("Todos");
    }
  }, [session]);

  useEffect(() => {
    const fetchCursos = async () => {
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
        setFetchingUsers(false);
        return;
      }
    };
    fetchCursos();
  }, []);

  useEffect(() => {
    const divElement = document.getElementById("usersList");
    divElement!.scrollTop = 0;

    const fetchSubmit = async () => {
      try {
        const data = new FormData();
        const searchParams = new URLSearchParams();

        searchParams.append("keyword", keyword);

        searchParams.append("cursoId", filterCursoInput);

        const res = await fetch(`/api/user?${searchParams.toString()}`, {
          method: "GET",
        });

        const resData = await res.json();

        if (res.ok && filterCursoInput !== "N/A") {
          setFetchingUsers(false);
          setUsersArr(resData.users);
          return;
        } else {
          setFetchingUsers(false);
          return;
        }
      } catch (error) {
        setFetchingUsers(false);

        return;
      }
    };
    if (filterCursoInput !== "N/A") {
      setFetchingUsers(true);
      fetchSubmit();
    } else {
      setUsersArr([]);
      setFetchingUsers(false);
    }
  }, [keyword, filterCursoInput]);

  return (
    <main className={styles.main}>
      <div className={styles.top}>
        <div className={styles.filterBox}>
          <SearchInput
            setInput={setInputSearch}
            input={inputSearch}
            action={() => {
              setKeyword(inputSearch);
            }}
          />

          <p>Curso:</p>
          <select
            onChange={(e) => setFilterCursoInput(e.target.value)}
            name="cursoFilter"
            id="cursoFilter"
            value={filterCursoInput}
          >
            {session && session.rol === "Profesor" ? (
              <option value="Todos">Todos</option>
            ) : (
              <option value="N/A">Escoja un curso</option>
            )}
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
        id="usersList"
        className={`${fetchingUsers ? styles.hidden : ""} ${styles.tableBox}`}
      >
        <table>
          <thead>
            <tr className={styles.tableHead}>
              <th className={styles.tableHeadName}>Nombre</th>
              <th className={styles.tableHeadName}>RUT</th>
              <th className={styles.tableHeadName}>Curso</th>
            </tr>
          </thead>
          <tbody
            id="usersList"
            className={`${styles.usersList} ${
              fetchingUsers ? styles.hidden : ""
            }`}
          >
            {fetchingUsers && usersArr ? (
              <>
                {Array.from({ length: 15 }, (_, index) => (
                  <tr key={index} className={styles.userItem}>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}
              </>
            ) : (
              usersArr.map((user: User, index) => {
                return (
                  <tr className={`${styles.userItem}`} key={user._id}>
                    <td className={styles.tableItem}>
                      <p className={styles.name}>
                        {`${user.nombre} ${user.apellido}`}
                      </p>
                    </td>
                    <td className={styles.tableItem}>
                      <p className={styles.name}>{`${user.dni}`}</p>
                    </td>
                    <td className={styles.a}>
                      <div className={styles.cursoBox}>
                        <p className={styles.name}>
                          {Array.isArray(user.curso) && user.curso.length > 0
                            ? user.curso
                                .map((curso) => {
                                  if ((curso as Curso).name)
                                    return (curso as Curso).name;
                                })
                                .join(" | ")
                            : "N/A"}
                        </p>
                        <div className={`${styles.btn} ${styles.monitorear}`}>
                          Resultados
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {session &&
          session.rol !== "Profesor" &&
          filterCursoInput === "N/A" && (
            <div className={styles.tableNone}>Escoja un curso</div>
          )}
        {session &&
          (session.rol === "Profesor" ||
            (session.rol !== "Profesor" && filterCursoInput !== "N/A")) &&
          !fetchingUsers &&
          usersArr.length === 0 && (
            <div className={styles.tableNone}>
              No se encontró ningún estudiante
            </div>
          )}
        {fetchingUsers ? (
          <div className={styles.overlay}>
            <div className={styles.loader}></div>
          </div>
        ) : (
          ""
        )}
      </div>
    </main>
  );
}
