"use client";
import styles from "./styles.module.css";
import User from "@/models/user";
import { Dispatch, SetStateAction, useRef } from "react";
import Curso from "@/models/curso";
import { useEffect, useState } from "react";
import { useOnboardingContext } from "@/lib/context";

interface CursoWrap extends Curso {
  edit: Boolean;
}

export default function Profile({}: {}) {
  const { session } = useOnboardingContext();
  const [rol, setRol] = useState("");
  const [apellido, setApellido] = useState("");
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [curso, setCurso] = useState<CursoWrap[]>([]);
  const [userId, setUserId] = useState("");
  const [userCursoInput, setUserCursoInput] = useState("N/A");
  const [errors, setErrors] = useState<string[]>([]);
  const [newPass, setNewPass] = useState("");
  const [cursosArr, setCursosArr] = useState<CursoWrap[]>([]);
  const [passChange, setPassChange] = useState(false);
  const [actualPass, setActualPass] = useState("");
  const [patching, setPatching] = useState(false);

  const cache = useRef(false);

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
          cache.current = true;
          return;
        } else {
          return;
        }
      } catch (error) {
        return;
      }
    };
    if (session&&!cache.current) {
      setRol(session.rol);
      setApellido(session.apellido);
      setNombre(session.nombre);
      setRut(session.dni);
      setCurso(session.curso);
      setUserId(session._id); 
         fetchSubmit();    

    }
  

  }, [session]);
  const patchUser = () => {
    setPatching(true);
    const newErrors: string[] = [];
    if (nombre === "" || nombre === "N/A") {
      newErrors.push("nombre");
    }
    if (apellido === "" || apellido === "N/A") {
      newErrors.push("apellido");
    }
    if (rut === "" || rut === "N/A") {
      newErrors.push("rut");
    }
    if (rol === "N/A") {
      newErrors.push("rol");
    }
    if (rol === "Estudiante" && curso.length === 0) {
      newErrors.push("curso");
    }
    if (passChange) {
      if (newPass === "") {
        newErrors.push("Clave Nueva");
      }
      if (actualPass === "") {
        newErrors.push("Clave Actual");
      }
    }

    if (newErrors.length === 0) {
      const fetchSubmit = async () => {
        try {
          const data = new FormData();
          data.set("nombre", nombre as string);
          data.set("apellido", apellido as string);
          data.set("rol", rol as string);
          data.set("rut", rut as string);
          if (passChange) {
            data.set("actualPass", actualPass as string);
            data.set("newPass", newPass as string);
          }

          if (rol === "Admin" || rol === "Directivo") {
            data.set("curso", JSON.stringify([]));
          }
          if (rol === "Profesor" || rol === "Estudiante") {
            const cursoArr = (curso as Curso[]).map((c) => c._id);
            data.set("curso", JSON.stringify(cursoArr));
          }

          const res = await fetch(`/api/user/${userId}/profile`, {
            method: "PATCH",
            body: data,
          });

          const resData = await res.json();
          setPatching(false);
          if (res.ok) {
            return;
          } else {
            newErrors.push(resData.error);
            setErrors(newErrors);
            return;
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchSubmit();
    } else {
      setPatching(false);

      setErrors(newErrors);
    }
  };

  const addCursoToUser = (curso: CursoWrap) => {
    setCurso((prev) => [...(prev as CursoWrap[]), curso]);
  };
  useEffect(() => {
    if (userCursoInput !== "N/A") {
      addCursoToUser(
        cursosArr[cursosArr.findIndex((curso) => userCursoInput === curso._id)]
      );
    }
    setUserCursoInput("N/A");
  }, [cursosArr, userCursoInput]);

  return (
    <main className={styles.main}>
      <div className={styles.editBox}>
        {session ? (
          <>
            <div className={styles.editItem}>
              <div className={styles.inputBox}>
                <label>Nombre</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  spellCheck="false"
                  placeholder="Nombre"
                  className={`${errors.includes("nombre") ? styles.wrong : ""}`}
                  type="text"
                  onFocus={() => setErrors([])}
                  disabled={!session || session.rol === "Estudiante"}
                />
              </div>
              <div className={styles.inputBox}>
                <label>Apellido</label>
                <input
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  spellCheck="false"
                  placeholder="Apellido"
                  className={`${
                    errors.includes("apellido") ? styles.wrong : ""
                  }`}
                  type="text"
                  onFocus={() => setErrors([])}
                  disabled={!session || session.rol === "Estudiante"}
                />
              </div>
              <div className={styles.inputBox}>
                <label>Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  name="editRol"
                  id="editRol"
                  className={`${errors.includes("rol") ? styles.wrong : ""}`}
                  onFocus={() => setErrors([])}
                  disabled={!session || session.rol !== "Admin"}
                >
                  <option value="N/A">N/A</option>
                  <option value="Admin">Admin</option>
                  <option value="Directivo">Directivo</option>
                  <option value="Profesor">Profesor</option>
                  <option value="Estudiante">Estudiante</option>
                </select>
              </div>
            </div>
            <div className={styles.editItem}>
              <div className={styles.inputBox}>
                <label>RUT</label>
                <input
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  spellCheck="false"
                  placeholder="RUT"
                  className={`${errors.includes("rut") ? styles.wrong : ""}`}
                  type="text"
                  onFocus={() => setErrors([])}
                  disabled={!session || session.rol !== "Admin"}
                />
              </div>
              {rol === "Profesor" ? (
                <div className={styles.inputBox}>
                  <label>Agregar Curso</label>
                  <div className={styles.cursosProfesor}>
                    <select
                      onChange={(e) => setUserCursoInput(e.target.value)}
                      name="userCurso"
                      id="userCurso"
                      value={"N/A"}
                    >
                      <option value="N/A">Agregar Curso</option>
                      {cursosArr
                        .filter((curso1) =>
                          (curso as CursoWrap[]).every((curso2) => {
                            return curso1._id !== curso2._id;
                          })
                        )
                        .map((curso) => (
                          <option key={curso._id} value={curso._id}>
                            {curso.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : (
                ""
              )}
              {rol === "Estudiante" ? (
                <div className={styles.inputBox}>
                  <label>Curso</label>
                  <select
                    value={
                      (curso as Curso[]).length > 0
                        ? (curso[0] as Curso)._id
                        : "N/A"
                    }
                    name="userCurso"
                    id="userCurso"
                    onChange={(e) => {
                      if (e.target.value !== "N/A") {
                        setCurso([
                          cursosArr[
                            cursosArr.findIndex(
                              (curso) => e.target.value === curso._id
                            )
                          ],
                        ]);
                      } else setCurso([]);
                    }}
                    onFocus={() => setErrors([])}
                    className={`${
                      errors.includes("curso") ? styles.wrong : ""
                    }`}
                    disabled={!session || session.rol !== "Admin"}
                  >
                    <option value="N/A">N/A</option>
                    {cursosArr.map((curso) => (
                      <option key={curso._id} value={curso._id}>
                        {curso.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                ""
              )}
            </div>
            {rol === "Profesor" ? (
              <>
                {Array.isArray(curso) &&
                  (curso as CursoWrap[]).map((curso, i) => (
                    <div key={curso._id} className={styles.cursoItem}>
                      {i === 0 ? <label>Cursos</label> : ""}

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
              </>
            ) : (
              ""
            )}
            {passChange ? (
              <div className={styles.editItem}>
                <div className={styles.inputBox}>
                  <label>Clave Actual</label>
                  <input
                    value={actualPass}
                    onChange={(e) => setActualPass(e.target.value)}
                    spellCheck="false"
                    placeholder="Clave Actual"
                    className={`${
                      errors.includes("Clave Actual") ? styles.wrong : ""
                    }`}
                    type="password"
                    onFocus={() => setErrors([])}
                  />
                </div>
                <div className={styles.inputBox}>
                  <label>Clave Nueva</label>
                  <input
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    spellCheck="false"
                    placeholder="Clave Nueva"
                    className={`${
                      errors.includes("Clave Nueva") ? styles.wrong : ""
                    }`}
                    type="password"
                    onFocus={() => setErrors([])}
                  />
                </div>
              </div>
            ) : (
              ""
            )}
            <div className={styles.modalOption}>
              {passChange ? (
                ""
              ) : (
                <div
                  onClick={() => setPassChange(true)}
                  className={`${styles.btn} ${styles.blue}`}
                >
                  Cambiar Contraseña
                </div>
              )}

              <div
                onClick={() => {
                  if (!patching) patchUser();
                }}
                className={`${styles.btn} ${
                  !patching ? styles.green : styles.grey
                } ml-auto`}
              >
                {!patching ? "Guardar" : <div className={styles.loader}></div>}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.loader}></div>
        )}
      </div>
    </main>
  );
}
