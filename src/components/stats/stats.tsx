"use client";
import styles from "@/components/management/styles.module.css";
import SearchInput from "@/components/management/searchInput/searchInput";
import User from "@/models/user";
import Curso from "@/models/curso";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CursoWrap } from "@/components/management/management";

export default function Stats() {
  const [keyword, setKeyword] = useState("");
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [usersArr, setUsersArr] = useState<User[]>([]);
  const [filterCursoInput, setFilterCursoInput] = useState("Todos");
  const [cursosArr, setCursosArr] = useState<CursoWrap[]>([]);
  const [inputSearch, setInputSearch] = useState("");

  useEffect(() => {
    setFetchingUsers(true);

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
        if (res.ok) {
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
    fetchSubmit();
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
    fetchSubmit();
    fetchCursos();
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
            <option value="Todos">Todos</option>
            {cursosArr.map((curso) => (
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
                    <td className={styles.tableItem}>
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
