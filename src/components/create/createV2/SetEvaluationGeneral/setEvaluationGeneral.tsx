import { Dispatch, SetStateAction } from "react";
import styles from "../../styles.module.css";
import Asignatura from "@/models/asignatura";

export default function SetEvaluationGeneral({
  setErrors,
  setQuestionErrorArr,
  name,
  setName,
  errors,
  tiempo,
  setTiempo,
  type,
  setType,
  nivel,
  setNivel,
  difficulty,
  setDifficulty,
  asignatura,
  setAsignatura,
  asignaturasArr,
  title,
}: {
  setErrors: Dispatch<SetStateAction<string[]>>;
  setQuestionErrorArr: Dispatch<SetStateAction<string[]>>;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  errors: string[];
  tiempo: number;
  setTiempo: Dispatch<SetStateAction<number>>;
  type: string;
  setType: Dispatch<SetStateAction<string>>;
  nivel: string;
  setNivel: Dispatch<SetStateAction<string>>;
  difficulty: string;
  setDifficulty: Dispatch<SetStateAction<string>>;
  asignatura: string;
  setAsignatura: Dispatch<SetStateAction<string>>;
  asignaturasArr: Asignatura[];
  title: string;
}) {
  return (
    <div className={styles.gestionGeneral}>
      <h1>{title} evaluación</h1>
      <div className={styles.mainTestOptionsBox}>
        <div className={styles.inputBox}>
          <label>Nombre</label>
          <input
            onFocus={() => {
              setErrors([]);
              setQuestionErrorArr([]);
            }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Nombre "
          />
          {errors.includes("name") ? (
            <p className={styles.error}>Campo obligatorio</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputBox}>
          <label>Tiempo</label>
          <input
            onFocus={() => {
              setErrors([]);
              setQuestionErrorArr([]);
            }}
            value={tiempo}
            onChange={(e) => setTiempo(parseInt(e.target.value) || 1)}
            type="number"
            placeholder="Tiempo "
            min={1}
          />
          {errors.includes("time") ? (
            <p className={styles.error}>Campo obligatorio</p>
          ) : (
            ""
          )}
        </div>
        <div className={styles.inputBox}>
          <label>Tipo de prueba</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={styles.dropdown}
            name="prueba"
            id="prueba"
          >
            <option value="Formativa">Formativa</option>
            <option value="Sumativa">Sumativa</option>
            <option value="Simce">Simce</option>
            <option value="PAES">PAES</option>
          </select>
        </div>
        <div className={styles.inputBox}>
          <label>Nivel de dificultad</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={styles.dropdown}
            name="dificultad"
            id="dificultad"
          >
            <option value="Básico">Básico</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>
        <div className={styles.inputBox}>
          <label>Nivel</label>
          <select
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            className={styles.dropdown}
            name="nivel"
            id="nivel"
          >
            <option value="1° Basico">1° Basico</option>
            <option value="2° Básico">2° Básico</option>
            <option value="3° Básico">3° Básico</option>
            <option value="4° Básico">4° Básico</option>
            <option value="5° Básico">5° Básico</option>
            <option value="6° Básico">6° Básico</option>
            <option value="7° Básico">7° Básico</option>
            <option value="8° Básico">8° Básico</option>
            <option value="1° Medio">1° Medio</option>
            <option value="2° Medio">2° Medio</option>
            <option value="3° Medio">3° Medio</option>
            <option value="4° Medio">4° Medio</option>
          </select>
        </div>
        <div className={styles.inputBox}>
          <label>Asignatura</label>
          <select
            value={asignatura}
            onChange={(e) => setAsignatura(e.target.value)}
            className={styles.dropdown}
            name="asignatura"
            id="asignatura"
          >
            <option value="N/A">Escoja una asignatura</option>
            {asignaturasArr &&
              asignaturasArr.map((asignatura) => (
                <option key={asignatura._id} value={asignatura._id}>
                  {asignatura.name}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
}
