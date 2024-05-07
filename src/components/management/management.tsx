"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./styles.module.css";
import User from "@/models/user";
import * as XLSX from "xlsx";
import Link from "next/link";
import Curso from "@/models/curso";
import Asignatura from "@/models/asignatura";
import DeleteModal from "@/components/management/deleteModal/deleteModal";
import UsersTable from "@/components/management/usersTable/usersTable";
import CursoTable from "@/components/management/cursoTable/cursoTable";
import AsignaturaTable from "@/components/management/asignaturaTable/asignaturaTable";

interface CursoWrap extends Curso {
  edit: Boolean;
}
export type { CursoWrap };

interface AsignaturaWrap extends Asignatura {
  edit: Boolean;
}

export type { AsignaturaWrap };

export default function Management() {
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [usersArr, setUsersArr] = useState<User[]>([]);
  const [keyword, setKeyword] = useState("");
  const [inputSearch, setInputSearch] = useState("");
  const [itemCount, setItemCount] = useState(1);
  const itemsPerPage = 25;
  const [pageArr, setPageArr] = useState<number[]>([]);
  const [pageSelected, setPageSelected] = useState(1);
  const [userDeleteIndex, setUserDeleteIndex] = useState<null | number>(null);
  const [filterRolInput, setFilterRolInput] = useState("Todos");
  const [passwordShowArr, setPasswordShowArr] = useState<boolean[]>([]);
  const [tabSelected, setTabSelected] = useState<
    "usuarios" | "cursos" | "asignaturas"
  >("usuarios");
  const [cursosArr, setCursosArr] = useState<CursoWrap[]>([]);
  const [cursoInput, setCursoInput] = useState("");
  const [fetchingCursos, setFetchingCursos] = useState(false);
  const [keywordCursos, setKeywordCursos] = useState("");
  const [cursoDeleteIndex, setCursoDeleteIndex] = useState<null | Curso>(null);
  const [asignaturasArr, setAsignaturasArr] = useState<AsignaturaWrap[]>([]);
  const [asignaturaInput, setAsignaturaInput] = useState("");
  const [fetchingAsignaturas, setFetchingAsignaturas] = useState(false);
  const [keywordAsignaturas, setKeywordAsignaturas] = useState("");
  const [asignaturaDeleteIndex, setAsignaturaDeleteIndex] =
    useState<null | Asignatura>(null);
  const [deleteUsers, setDeleteUsers] = useState<string[] | null>(null);
  const [filterReviewInput, setFilterReviewInput] = useState<boolean>(false);

  const addCurso = () => {
    if (
      cursoInput !== "" &&
      !cursosArr.some((curso) => curso.name === cursoInput)
    ) {
      const newCurso: CursoWrap = { name: cursoInput.trim(), edit: false };
      setCursosArr((prev) => [...prev, newCurso]);
      setCursoInput("");
      const actualIndex = cursosArr.length;

      const fetchSubmit = async (newCurso: CursoWrap, index: number) => {
        try {
          const data = new FormData();
          data.append("name", cursoInput.trim());

          const res = await fetch(`/api/curso`, {
            method: "POST",
            body: data,
          });

          const resData = await res.json();
          setFetchingUsers(false);
          if (res.ok) {
            setCursosArr((prev: CursoWrap[]) => {
              const newCursos = [...prev];
              newCursos[index] = {
                ...newCurso,
                _id: resData.id,
              };

              return newCursos;
            });
          } else {
            // Handle error
          }
        } catch (error) {
          setFetchingUsers(false);
          // Handle error
        }
      };
      fetchSubmit(newCurso, actualIndex);
    }
  };

  const deleteCurso = async () => {
    const newCursosArr = [...cursosArr];
    const cursoFindDeleteIndex = newCursosArr.findIndex(
      (curso) => curso._id === cursoDeleteIndex?._id
    );
    const deleteUser = newCursosArr.splice(cursoFindDeleteIndex as number, 1);
    const deleteFetch = async () => {
      try {
        const res = await fetch(`/api/curso/${deleteUser[0]._id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setPageSelected(0);
          return;
        }
      } catch (error) {
        return;
      }
    };
    deleteFetch();
    setCursosArr(newCursosArr);
    setCursoDeleteIndex(null);
  };

  const editCurso = async (id: string, newName: string) => {
    // Actualiza el estado del curso en el cliente inmediatamente
    setCursosArr((prevCursos) => {
      return prevCursos.map((curso) => {
        if (curso._id === id) {
          return { ...curso, name: newName, edit: false }; // Actualiza el nombre del curso
        } else {
          return curso;
        }
      });
    });

    try {
      const res = await fetch(`/api/curso/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar el curso en el servidor.");
      }
    } catch (error) {
      // Maneja el error
      console.error("Error al actualizar el curso:", error);
    }
  };

  const handleCursoEdit = (index: number) => {
    const newCursosArr = [...cursosArr];
    if (newCursosArr[index]._id) {
      newCursosArr[index].edit = !newCursosArr[index].edit;
      setCursosArr(newCursosArr);
    }
  };

  const addAsignatura = () => {
    if (
      asignaturaInput !== "" &&
      !asignaturasArr.some((asignatura) => asignatura.name === asignaturaInput)
    ) {
      const newAsignatura: AsignaturaWrap = {
        name: asignaturaInput.trim(),
        edit: false,
      };
      setAsignaturasArr((prev) => [...prev, newAsignatura]);
      setAsignaturaInput("");
      const actualIndex = asignaturasArr.length;

      const fetchSubmit = async (
        newAsignatura: AsignaturaWrap,
        index: number
      ) => {
        try {
          const data = new FormData();
          data.append("name", asignaturaInput.trim());

          const res = await fetch(`/api/asignatura`, {
            method: "POST",
            body: data,
          });

          const resData = await res.json();
          setFetchingAsignaturas(false);
          if (res.ok) {
            setAsignaturasArr((prev: AsignaturaWrap[]) => {
              const newAsignaturas = [...prev];
              newAsignaturas[index] = {
                ...newAsignatura,
                _id: resData.id,
              };

              return newAsignaturas;
            });
          } else {
            // Handle error
          }
        } catch (error) {
          setFetchingAsignaturas(false);
          // Handle error
        }
      };
      fetchSubmit(newAsignatura, actualIndex);
    }
  };

  const deleteAsignatura = async () => {
    const newAsignaturasArr = [...asignaturasArr];
    const asignaturaFindDeleteIndex = newAsignaturasArr.findIndex(
      (asignatura) => asignatura._id === asignaturaDeleteIndex?._id
    );
    const deleteAsignatura = newAsignaturasArr.splice(
      asignaturaFindDeleteIndex as number,
      1
    );
    const deleteFetch = async () => {
      try {
        const res = await fetch(`/api/asignatura/${deleteAsignatura[0]._id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          return;
        }
      } catch (error) {
        return;
      }
    };
    deleteFetch();
    setAsignaturasArr(newAsignaturasArr);
    setAsignaturaDeleteIndex(null);
  };

  const editAsignatura = async (id: string, newName: string) => {
    // Actualiza el estado de la asignatura en el cliente inmediatamente
    setAsignaturasArr((prevAsignaturas) => {
      return prevAsignaturas.map((asignatura) => {
        if (asignatura._id === id) {
          return { ...asignatura, name: newName, edit: false }; // Actualiza el nombre de la asignatura
        } else {
          return asignatura;
        }
      });
    });

    try {
      const res = await fetch(`/api/asignatura/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar la asignatura en el servidor.");
      }
    } catch (error) {
      // Maneja el error
      console.error("Error al actualizar la asignatura:", error);
    }
  };

  const handleAsignaturaEdit = (index: number) => {
    const newAsignaturasArr = [...asignaturasArr];
    if (newAsignaturasArr[index]._id) {
      newAsignaturasArr[index].edit = !newAsignaturasArr[index].edit;
      setAsignaturasArr(newAsignaturasArr);
    }
  };

  const deleteUser = async () => {
    const newUsersArr = [...usersArr];
    const deleteUser = newUsersArr.splice(userDeleteIndex as number, 1);
    const deleteFetch = async () => {
      try {
        const res = await fetch(`/api/user/${deleteUser[0]._id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          return;
        }
      } catch (error) {
        return;
      }
    };
    deleteFetch();
    setUsersArr(newUsersArr);
    setUserDeleteIndex(null);
  };

  useEffect(() => {
    const newPageArr = Array.from(
      {
        length: Math.ceil(itemCount / itemsPerPage),
      },
      (_, index) => index + 1
    );

    setPageArr(newPageArr);
  }, [itemCount]);

  useEffect(() => {
    setPageSelected(1);
  }, [filterRolInput]);

  useEffect(() => {
    if (tabSelected === "usuarios") {
      const divElement = document.getElementById("usersList");
      divElement!.scrollTop = 0;

      setFetchingUsers(true);

      const page = pageSelected.toString();

      const fetchSubmit = async () => {
        try {
          const data = new FormData();
          const searchParams = new URLSearchParams();

          searchParams.append("keyword", keyword);
          searchParams.append("page", page);
          searchParams.append("filterRolInput", filterRolInput);
          searchParams.append("review", filterReviewInput.toString());

          const res = await fetch(`/api/user?${searchParams.toString()}`, {
            method: "GET",
          });

          const resData = await res.json();
          setItemCount(resData.totalCount);
          if (res.ok) {
            setFetchingUsers(false);
            console.log(resData);
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
      if (pageSelected > 0) fetchSubmit();
      else {
        setPageSelected(1);
      }
    }
  }, [filterRolInput, keyword, pageSelected, filterReviewInput, tabSelected]);

  useEffect(() => {
    if (tabSelected === "asignaturas") {
      const divElement = document.getElementById("wrapBoxAsignatura");
      if (divElement?.scrollTop) {
        divElement!.scrollTop = 0;
      }

      setFetchingAsignaturas(true);
      const fetchSubmit = async () => {
        try {
          const res = await fetch(`/api/asignatura`, {
            method: "GET",
          });

          const resData = await res.json();
          setFetchingAsignaturas(false);
          if (res.ok) {
            const newAsignaturas = resData.asignaturas.map(
              (asignatura: AsignaturaWrap) => {
                return { ...asignatura, edit: false };
              }
            );
            setAsignaturasArr(newAsignaturas);
            return;
          } else {
            return;
          }
        } catch (error) {
          setFetchingAsignaturas(false);
          return;
        }
      };
      fetchSubmit();
    }
    if (tabSelected === "cursos") {
      const divElement = document.getElementById("wrapBox");
      if (divElement?.scrollTop) {
        divElement!.scrollTop = 0;
      }

      setFetchingCursos(true);
      const fetchSubmit = async () => {
        try {
          const res = await fetch(`/api/curso`, {
            method: "GET",
          });

          const resData = await res.json();
          setFetchingCursos(false);
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
    }
  }, [tabSelected]);

  useEffect(() => {
    setPasswordShowArr(
      Array.from({ length: usersArr.length }, (_, index) => false)
    );
  }, [usersArr]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const sheetName = workbook.SheetNames[0]; // Suponiendo que los usuarios están en la primera hoja
        const sheet = workbook.Sheets[sheetName];
        interface UserArr {
          nombre: string;
          apellido: string;
          rol: string;
          dni: string;
          curso: string;
        }

        interface UserSheet {
          Nombre: string;
          Apellido: string;
          Rol: string;
          RUT: string;
          Curso: string;
        }

        const usersSheet: UserSheet[] = XLSX.utils.sheet_to_json(sheet);

        console.log(usersSheet);
        const users: UserArr[] = usersSheet.map(
          (user: UserSheet, index: number) => {
            return {
              nombre: user.Nombre,
              apellido: user.Apellido,
              rol: user.Rol,
              dni: user.RUT,
              curso: user.Curso,
            };
          }
        );

        // Resetea el input de tipo archivo después de leer el archivo
        setFetchingUsers(true);

        const fetchSubmit = async () => {
          try {
            const data = new FormData();
            users.forEach((user, index) => {
              data.append("users", JSON.stringify(user));
            });

            const res = await fetch(`/api/user`, {
              method: "POST",
              body: data,
            });

            const resData = await res.json();
            if (res.ok) {
              console.log(resData.users);
              setPageSelected(0);
            } else {
              console.log(resData.message);
              // Handle error
              setFetchingUsers(false);
            }
          } catch (error) {
            console.log(error);
            setFetchingUsers(false);
            // Handle error
          }
        };
        fetchSubmit();
        let fileInput = document.getElementById("excelFileInput");

        if (fileInput instanceof HTMLInputElement) {
          fileInput.value = "";
          fileInput.dispatchEvent(new Event("change"));
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const submitDeleteUsers = () => {
    setUsersArr([]);
    setFetchingUsers(true);
    setDeleteUsers(null);
    const fetchDeleteUsers = async () => {
      try {
        const searchParams = new URLSearchParams();
        deleteUsers?.forEach((deleteUser) => {
          searchParams.append("users", deleteUser);
        });

        const res = await fetch(`/api/user?${searchParams}`, {
          method: "DELETE",
        });

        const resData = await res.json();

        if (res.ok) {
          setPageSelected(0);
        } else {
          setFetchingUsers(false);
          // Handle error
        }
      } catch (error) {
        // Handle error
        setFetchingUsers(false);
      }
    };
    fetchDeleteUsers();
  };

  return (
    <main className={styles.main}>
      <input
        className={styles.none}
        type="file"
        id="excelFileInput"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />
      {/*I add !== null because if you choose the index 0 it will be false instead of true */}
      {userDeleteIndex !== null ? (
        <DeleteModal
          modalItemName={`${usersArr[userDeleteIndex].nombre} ${usersArr[userDeleteIndex].apellido}`}
          itemPronoun="al usuario"
          yesAction={deleteUser}
          noAction={() => setUserDeleteIndex(null)}
        />
      ) : (
        ""
      )}
      {/*I add !== null because if you choose the index 0 it will be false instead of true */}
      {cursoDeleteIndex !== null ? (
        <DeleteModal
          modalItemName={cursoDeleteIndex.name}
          itemPronoun="el curso"
          yesAction={deleteCurso}
          noAction={() => setCursoDeleteIndex(null)}
        />
      ) : (
        ""
      )}
      {asignaturaDeleteIndex !== null ? (
        <DeleteModal
          modalItemName={asignaturaDeleteIndex.name}
          itemPronoun="la asignatura"
          yesAction={deleteAsignatura}
          noAction={() => setAsignaturaDeleteIndex(null)}
        />
      ) : (
        ""
      )}
      <h1>Gestion general</h1>
      <div className={styles.tabsBox}>
        <div
          onClick={() => setTabSelected("usuarios")}
          className={`${styles.tabBox} ${
            tabSelected === "usuarios" ? styles.tabSelected : ""
          }`}
        >
          <p>Usuarios</p>
        </div>

        <div
          onClick={() => setTabSelected("cursos")}
          className={`${styles.tabBox} ${
            tabSelected === "cursos" ? styles.tabSelected : ""
          }`}
        >
          <p>Cursos</p>
        </div>
        <div
          onClick={() => setTabSelected("asignaturas")}
          className={`${styles.tabBox} ${
            tabSelected === "asignaturas" ? styles.tabSelected : ""
          }`}
        >
          <p>Asignaturas</p>
        </div>
        <a
          className={styles.downloadExcel}
          href="/plantilla de excel.xlsx"
          download="plantilla de excel.xlsx"
        >
          <p>Descargar plantilla de Excel</p>
        </a>
      </div>
      {tabSelected === "usuarios" ? (
        <UsersTable
          setInputSearch={setInputSearch}
          inputSearch={inputSearch}
          setKeyword={setKeyword}
          setFilterRolInput={setFilterRolInput}
          filterRolInput={filterRolInput}
          setFilterReviewInput={setFilterReviewInput}
          filterReviewInput={filterReviewInput}
          deleteUsers={deleteUsers}
          setDeleteUsers={setDeleteUsers}
          submitDeleteUsers={submitDeleteUsers}
          passwordShowArr={passwordShowArr}
          setPasswordShowArr={setPasswordShowArr}
          fetchingUsers={fetchingUsers}
          usersArr={usersArr}
          pageSelected={pageSelected}
          setUserDeleteIndex={setUserDeleteIndex}
          pageArr={pageArr}
          setPageSelected={setPageSelected}
        />
      ) : tabSelected === "cursos" ? (
        <CursoTable
          setKeywordCursos={setKeywordCursos}
          keywordCursos={keywordCursos}
          fetchingCursos={fetchingCursos}
          addCurso={addCurso}
          cursoInput={cursoInput}
          setCursoInput={setCursoInput}
          cursosArr={cursosArr}
          setCursoDeleteIndex={setCursoDeleteIndex}
          handleCursoEdit={handleCursoEdit}
          editCurso={editCurso}
        />
      ) : tabSelected === "asignaturas" ? (
        <AsignaturaTable
          setKeywordAsignaturas={setKeywordAsignaturas}
          keywordAsignaturas={keywordAsignaturas}
          fetchingAsignaturas={fetchingAsignaturas}
          addAsignatura={addAsignatura}
          asignaturaInput={asignaturaInput}
          setAsignaturaInput={setAsignaturaInput}
          asignaturasArr={asignaturasArr}
          setAsignaturaDeleteIndex={setAsignaturaDeleteIndex}
          handleAsignaturaEdit={handleAsignaturaEdit}
          editAsignatura={editAsignatura}
        />
      ) : (
        ""
      )}
    </main>
  );
}
