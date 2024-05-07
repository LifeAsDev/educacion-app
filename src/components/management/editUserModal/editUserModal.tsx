import styles from "./styles.module.css";
import User from "@/models/user";
import { Dispatch, SetStateAction } from "react";
import Curso from "@/models/curso";
import { useEffect, useState } from "react";

interface CursoWrap extends Curso {
  edit: Boolean;
}

export default function EditUserModal({
  userSelected,
  setUserSelected,
  cursosArr,
}: {
  userSelected: User;
  setUserSelected: Dispatch<SetStateAction<User | null>>;
  cursosArr: CursoWrap[];
}) {
  const [rol, setRol] = useState(userSelected.rol);
  const [apellido, setApellido] = useState(userSelected.apellido);
  const [nombre, setNombre] = useState(userSelected.nombre);
  const [rut, setRut] = useState(userSelected.dni);
  const [curso, setCurso] = useState(userSelected.curso);
  const [userCursoInput, setUserCursoInput] = useState("N/A");
  const [userId, setUserId] = useState(userSelected._id);

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
          <div className={styles.inputBox}>
            <label>ID</label>
            <p className={styles.id}>{userId}</p>
          </div>
        </div>
        <div className={styles.editItem}>
          <div className={styles.inputBox}>
            <label>Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              spellCheck="false"
              placeholder="Nombre"
              className=""
              type="text"
            />
          </div>
          <div className={styles.inputBox}>
            <label>Apellido</label>
            <input
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              spellCheck="false"
              placeholder="Apellido"
              className=""
              type="text"
            />
          </div>
          <div className={styles.inputBox}>
            <label>Rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              name="editRol"
              id="editRol"
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
              className=""
              type="text"
            />
          </div>
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
        </div>
        {rol === "Estudiante" ? (
          <div className={styles.inputBox}>
            <label>Curso</label>
            <select name="userCurso" id="userCurso">
              <option value="N/A">N/A</option>
              {cursosArr.map((curso) => (
                <option key={curso._id} value={curso._id}>
                  {curso.name}
                </option>
              ))}
            </select>
          </div>
        ) : rol === "Profesor" ? (
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
          <div className={`${styles.btn} ${styles.green}`}>Guardar</div>
        </div>
      </div>
    </div>
  );
}
