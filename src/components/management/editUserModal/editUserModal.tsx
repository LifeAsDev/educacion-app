import styles from "./styles.module.css";
import User from "@/models/user";
import { Dispatch, SetStateAction } from "react";
import Curso from "@/models/curso";
import { useEffect, useState } from "react";
import { AsignaturaWrap, UserArr } from "../management";
import { ObjectId } from "mongoose";

interface CursoWrap extends Curso {
  edit: Boolean;
}

export default function EditUserModal({
  userSelected,
  setUserSelected,
  cursosArr,
  setPageSelected,
  setFetchingUsers,
  asignaturasArr,
  postUsers,
}: {
  userSelected: User | string;
  setUserSelected: Dispatch<SetStateAction<User | null | string>>;
  cursosArr: CursoWrap[];
  setPageSelected: Dispatch<SetStateAction<number>>;
  setFetchingUsers: Dispatch<SetStateAction<boolean>>;
  asignaturasArr: AsignaturaWrap[];
  postUsers: (users: UserArr[]) => Promise<void>;
}) {
  const [rol, setRol] = useState("N/A");
  const [apellido, setApellido] = useState("");
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [curso, setCurso] = useState<Curso[]>([]);
  const [userId, setUserId] = useState("");
  const [userCursoInput, setUserCursoInput] = useState("N/A");
  const [errors, setErrors] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [asignatura, setAsignatura] = useState("N/A");

  useEffect(() => {
    if (typeof userSelected !== "string") {
      setRol(userSelected.rol);
      setApellido(userSelected.apellido);
      setNombre(userSelected.nombre);
      setRut(userSelected.dni);
      setCurso(userSelected.curso as Curso[]);
      setUserId(userSelected._id);
      setPassword(userSelected.password);
      setAsignatura(userSelected.asignatura?._id || "N/A");
    } else if (userSelected === "Create") {
    }
  }, [userSelected]);

  const patchUser = () => {
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
    if (rol === "Profesor" && asignatura === "N/A") {
      newErrors.push("asignatura");
    }
    if (rol === "Estudiante" && curso.length === 0) {
      newErrors.push("curso");
    }
    if (userSelected !== "Create" && password === "") {
      newErrors.push("password");
    }

    if (newErrors.length === 0) {
      const divElement = document.getElementById("usersList");
      divElement!.scrollTop = 0;
      setFetchingUsers(true);
      setUserSelected(null);
      const fetchSubmit = async () => {
        try {
          const data = new FormData();
          data.set("nombre", nombre as string);
          data.set("apellido", apellido as string);
          data.set("rol", rol as string);
          data.set("rut", rut as string);
          data.set("password", password as string);

          if (rol === "Admin" || rol === "Directivo") {
            data.set("curso", JSON.stringify([]));
          }
          if (rol === "Profesor") {
            const cursoArr = (curso as Curso[]).map((c) => c._id);
            data.set("curso", JSON.stringify(cursoArr));
            data.set("asignatura", asignatura as string);
          }
          if (rol === "Estudiante") {
            const cursoArr = [curso[0]];
            data.set("curso", JSON.stringify(cursoArr));
          }

          const res = await fetch(`/api/user/${userId}`, {
            method: "PATCH",
            body: data,
          });

          const resData = await res.json();
          if (res.ok) {
            setPageSelected(0);
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
      if (userSelected === "Create") {
        postUsers([
          {
            nombre: nombre,
            apellido: apellido,
            rol: rol,
            dni: rut,
            curso: curso.map((cursoItem) => cursoItem.name).join(","),
            asignatura: asignaturasArr.find((asignaturaItem) => {
              return asignaturaItem._id?.toString() === asignatura;
            })?.name,
          },
        ]);
      } else {
        fetchSubmit();
      }
    } else {
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
    <div className={styles.overlay}>
      <div className={styles.editBox}>
        <div className={styles.editItem}>
          {userSelected !== "Create" && (
            <>
              <div className={`${styles.inputBox} ${styles.id}`}>
                <label>ID</label>
                <p>{userId}</p>
              </div>

              <div className={styles.inputBox}>
                <label>Clave</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  spellCheck="false"
                  placeholder="Clave"
                  className={`${
                    errors.includes("password") ? styles.wrong : ""
                  }`}
                  type="text"
                  onFocus={() => setErrors([])}
                />
              </div>
            </>
          )}
        </div>
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
            />
          </div>
          <div className={styles.inputBox}>
            <label>Apellido</label>
            <input
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              spellCheck="false"
              placeholder="Apellido"
              className={`${errors.includes("apellido") ? styles.wrong : ""}`}
              type="text"
              onFocus={() => setErrors([])}
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
            />
          </div>
          {rol === "Profesor" ? (
            <>
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
              <div className={styles.inputBox}>
                <label>Asignatura</label>
                <div
                  className={`${styles.cursosProfesor} ${
                    errors.includes("asignatura") ? styles.wrong : ""
                  }`}
                >
                  <select
                    onFocus={() => setErrors([])}
                    className={`${
                      errors.includes("asignatura") ? styles.wrong : ""
                    }`}
                    onChange={(e) => setAsignatura(e.target.value)}
                    name="userAsignatura"
                    id="userAsignatura"
                    value={asignatura as string}
                  >
                    <option value="N/A">N/A</option>
                    {asignaturasArr.map((asignatura) => (
                      <option key={asignatura._id} value={asignatura._id}>
                        {asignatura.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
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
                className={`${errors.includes("curso") ? styles.wrong : ""}`}
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
                        (prev as CursoWrap[]).filter((c) => c._id !== curso._id)
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
        <div className={styles.modalOption}>
          <div
            onClick={() => setUserSelected(null)}
            className={`${styles.btn} ${styles.red}`}
          >
            Cancelar
          </div>
          <div
            onClick={() => {
              patchUser();
            }}
            className={`${styles.btn} ${styles.green}`}
          >
            {userSelected !== "Create" ? "Guardar" : "Crear Usuario"}
          </div>
        </div>
      </div>
    </div>
  );
}
