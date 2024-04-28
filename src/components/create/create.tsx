"use client";
import styles from "./styles.module.css";
import { useState, useEffect, useRef } from "react";
import Question from "@/models/question";
import { v4 as uuidv4 } from "uuid"; // Importa la función uuidv4
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Create() {
  const [typeOfQuestionSelected, setTypeOfQuestionSelected] =
    useState("multiple");

  const router = useRouter();

  const [questionArr, setQuestionArr] = useState<Question[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("formativa");
  const [difficulty, setDifficulty] = useState("basico");
  const [clase, setClase] = useState("A");
  const [grado, setGrado] = useState("7");
  const [submitting, setSubmitting] = useState(false);

  const editQuestion = (
    property: keyof Question,
    value: string,
    index: number
  ) => {
    const newQuestion = [...questionArr];
    newQuestion[index][property] = value;
    setQuestionArr(newQuestion);
  };

  const createQuestion = () => {
    let newQuestion: Question;
    if (typeOfQuestionSelected === "open") {
      newQuestion = { type: "open", pregunta: "", id: uuidv4() };
    } else if (typeOfQuestionSelected === "multiple") {
      newQuestion = {
        type: "multiple",
        pregunta: "",
        correcta: "",
        señuelo1: "",
        señuelo2: "",
        señuelo3: "",
        id: uuidv4(),
      };
    }

    setQuestionArr((prev) => [...prev, newQuestion]);
  };

  const deleteQuestion = (questionIndex: number) => {
    console.log(questionIndex);
    const newQuestionArr = [...questionArr];
    console.log(newQuestionArr);
    newQuestionArr.splice(questionIndex, 1);
    console.log(newQuestionArr);
    setQuestionArr(newQuestionArr);
  };

  const cache = useRef(false);
  useEffect(() => {
    const cachedState = localStorage.getItem("createState");
    if (cachedState && !cache.current) {
      cache.current = true;
      const parseCachedState = JSON.parse(cachedState);
      setQuestionArr(parseCachedState.questionArr);
      setName(parseCachedState.name);
      setType(parseCachedState.type);
      setDifficulty(parseCachedState.difficulty);
      setClase(parseCachedState.clase);
      setGrado(parseCachedState.grado);
    }
  }, []);
  useEffect(() => {
    if (!submitting)
      localStorage.setItem(
        "createState",
        JSON.stringify({ questionArr, name, type, difficulty, grado, clase })
      );
  }, [clase, difficulty, grado, name, questionArr, submitting, type]);

  const submitEvaluationTest = async () => {
    localStorage.removeItem("createState");

    setSubmitting(true);
    try {
      const data = new FormData();
      data.set("name", name as string);
      data.set("type", type as string);
      data.set("difficulty", difficulty as string);
      data.set("clase", clase as string);
      data.set("grado", grado as string);

      questionArr.forEach((question) => {
        const questionString = JSON.stringify(question);
        data.append("questionArr", questionString);
      });

      const res = await fetch("/api/evaluation-test", {
        method: "POST",
        body: data,
      });
      const resData = await res.json();

      if (res.ok) {
        router.push(`/evaluation`);
        return true;
      } else {
        return;
      }
    } catch (error) {
      return;
    }
  };
  const rolTest: string = "directivo";
  return (
    <main className={styles.main}>
      {submitting ? (
        <div className={styles.submitting}>
          <div className={styles.loader}></div>
          Creando Evaluación
        </div>
      ) : (
        ""
      )}
      <div className={styles.backBtn}>
        <svg
          fill="var(--primary-light-blue)"
          height="28px"
          width="28px"
          version="1.1"
          id="Layer_1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          enableBackground="new 0 0 512 512"
        >
          <polygon points="213.3,205.3 213.3,77.3 0,248 213.3,418.7 213.3,290.7 512,290.7 512,205.3 " />
        </svg>
        <Link href={"/evaluation"}>Volver</Link>
      </div>
      <h1>Creación de evaluación</h1>
      <div className={styles.mainTestOptionsBox}>
        <div className={styles.inputBox}>
          <label>Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Nombre "
          />
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
            <option value="formativa">Formativa</option>
            <option value="sumativa">Sumativa</option>
            <option value="simce">Simce</option>
            <option value="paes">PAES</option>
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
            <option value="basico">Básico</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
          </select>
        </div>
        {rolTest === "directivo" || rolTest === "administrador" ? (
          <>
            <div className={styles.inputBox}>
              <label>Clase</label>
              <select
                value={clase}
                onChange={(e) => setClase(e.target.value)}
                className={styles.dropdown}
                name="clase"
                id="clase"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div className={styles.inputBox}>
              <label>Grado</label>
              <select
                value={grado}
                onChange={(e) => setGrado(e.target.value)}
                className={styles.dropdown}
                name="grado"
                id="grado"
              >
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>
          </>
        ) : (
          ""
        )}
      </div>
      <div className={styles.questionBox}>
        {questionArr.map((question, i) =>
          question.type === "open" ? (
            <div key={question.id} className={styles.openQuestionBox}>
              <div
                onClick={() => deleteQuestion(i)}
                className={styles.deleteBtn}
              >
                <svg
                  width="40px"
                  height="40px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.29802 12.6172L6.03847 12.7365L5.29802 12.6172ZM6.62639 9.77989L6.75843 9.04161L6.33817 8.96645L6.05898 9.28944L6.62639 9.77989ZM5.26042 12.8505L4.51997 12.7312H4.51997L5.26042 12.8505ZM5.45105 16.0429L4.73 16.2492H4.73L5.45105 16.0429ZM5.5687 16.454L6.28976 16.2477H6.28976L5.5687 16.454ZM10.595 20.8812L10.469 21.6205L10.469 21.6205L10.595 20.8812ZM13.4049 20.8812L13.531 21.6205L13.4049 20.8812ZM18.4313 16.454L17.7102 16.2477V16.2477L18.4313 16.454ZM18.5489 16.0429L19.27 16.2492L18.5489 16.0429ZM18.7396 12.8505L19.48 12.7312V12.7312L18.7396 12.8505ZM18.702 12.6172L17.9615 12.7365L18.702 12.6172ZM17.3736 9.77989L17.941 9.28944L17.6618 8.96645L17.2416 9.04161L17.3736 9.77989ZM17.5112 9.75496L17.3758 9.01728L17.5112 9.75496ZM6.48878 9.75496L6.6242 9.01728L6.48878 9.75496ZM9 5.9125H8.25V6.6625H9V5.9125ZM9.87868 3.85305L10.4011 4.39117V4.39117L9.87868 3.85305ZM10.8519 3.2217L11.1318 3.91755L10.8519 3.2217ZM13.1481 3.2217L12.8682 3.91755L12.8682 3.91755L13.1481 3.2217ZM14.7716 4.79794L15.4615 4.50361V4.50361L14.7716 4.79794ZM15 5.9125V6.6625L15.75 6.6625V5.9125H15ZM10.75 12.7083C10.75 12.2941 10.4142 11.9583 10 11.9583C9.58579 11.9583 9.25 12.2941 9.25 12.7083H10.75ZM9.25 16.5917C9.25 17.0059 9.58579 17.3417 10 17.3417C10.4142 17.3417 10.75 17.0059 10.75 16.5917H9.25ZM14.75 12.7083C14.75 12.2941 14.4142 11.9583 14 11.9583C13.5858 11.9583 13.25 12.2941 13.25 12.7083H14.75ZM13.25 16.5917C13.25 17.0059 13.5858 17.3417 14 17.3417C14.4142 17.3417 14.75 17.0059 14.75 16.5917H13.25ZM6.03847 12.7365C6.18791 11.809 6.59553 10.9625 7.19381 10.2703L6.05898 9.28944C5.28502 10.1848 4.75279 11.2863 4.55757 12.4979L6.03847 12.7365ZM6.00087 12.9698L6.03847 12.7365L4.55757 12.4979L4.51997 12.7312L6.00087 12.9698ZM6.17211 15.8365C5.90508 14.9034 5.84678 13.9262 6.00087 12.9698L4.51997 12.7312C4.33081 13.9052 4.4025 15.1048 4.73 16.2492L6.17211 15.8365ZM6.28976 16.2477L6.17211 15.8365L4.73 16.2492L4.84765 16.6604L6.28976 16.2477ZM10.7211 20.1418C8.58113 19.777 6.86392 18.254 6.28976 16.2477L4.84765 16.6604C5.58591 19.2401 7.78001 21.1621 10.469 21.6205L10.7211 20.1418ZM13.2789 20.1418C12.4328 20.2861 11.5672 20.2861 10.7211 20.1418L10.469 21.6205C11.4819 21.7932 12.518 21.7932 13.531 21.6205L13.2789 20.1418ZM17.7102 16.2477C17.1361 18.254 15.4188 19.777 13.2789 20.1418L13.531 21.6205C16.22 21.1621 18.4141 19.2401 19.1523 16.6604L17.7102 16.2477ZM17.8279 15.8365L17.7102 16.2477L19.1523 16.6604L19.27 16.2492L17.8279 15.8365ZM17.9991 12.9698C18.1532 13.9262 18.0949 14.9034 17.8279 15.8365L19.27 16.2492C19.5975 15.1048 19.6692 13.9052 19.48 12.7312L17.9991 12.9698ZM17.9615 12.7365L17.9991 12.9698L19.48 12.7312L19.4424 12.4979L17.9615 12.7365ZM16.8062 10.2703C17.4045 10.9625 17.8121 11.809 17.9615 12.7365L19.4424 12.4979C19.2472 11.2863 18.715 10.1848 17.941 9.28944L16.8062 10.2703ZM17.2416 9.04161C13.7764 9.6613 10.2236 9.6613 6.75843 9.04161L6.49436 10.5182C10.1342 11.1691 13.8658 11.1691 17.5056 10.5182L17.2416 9.04161ZM7.01045 6.6625H16.9895V5.1625H7.01045V6.6625ZM18.25 7.86432V8.01068H19.75V7.86432H18.25ZM5.75 8.01068V7.86432H4.25V8.01068H5.75ZM17.3758 9.01728C13.8235 9.66941 10.1765 9.66941 6.6242 9.01728L6.35336 10.4926C10.0848 11.1776 13.9152 11.1776 17.6466 10.4926L17.3758 9.01728ZM4.25 8.01068C4.25 9.24128 5.14914 10.2716 6.35336 10.4926L6.6242 9.01728C6.10132 8.9213 5.75 8.48652 5.75 8.01068H4.25ZM18.25 8.01068C18.25 8.48652 17.8987 8.9213 17.3758 9.01728L17.6466 10.4926C18.8509 10.2716 19.75 9.24129 19.75 8.01068H18.25ZM16.9895 6.6625C17.7068 6.6625 18.25 7.22135 18.25 7.86432H19.75C19.75 6.35138 18.493 5.1625 16.9895 5.1625V6.6625ZM7.01045 5.1625C5.50698 5.1625 4.25 6.35138 4.25 7.86432H5.75C5.75 7.22135 6.29324 6.6625 7.01045 6.6625V5.1625ZM8.53853 4.50361C8.34824 4.94959 8.25 5.4284 8.25 5.9125H9.75C9.75 5.63165 9.80695 5.353 9.9182 5.09226L8.53853 4.50361ZM9.35626 3.31493C9.00703 3.65398 8.72878 4.05769 8.53853 4.50361L9.9182 5.09226C10.0295 4.83146 10.1932 4.59303 10.4011 4.39117L9.35626 3.31493ZM10.5721 2.52586C10.1188 2.70816 9.70544 2.97594 9.35626 3.31493L10.4011 4.39117C10.6091 4.18927 10.8572 4.02797 11.1318 3.91755L10.5721 2.52586ZM12 2.25C11.5106 2.25 11.0254 2.34356 10.5721 2.52586L11.1318 3.91755C11.4064 3.80711 11.7015 3.75 12 3.75V2.25ZM13.4279 2.52586C12.9746 2.34356 12.4894 2.25 12 2.25V3.75C12.2985 3.75 12.5936 3.80711 12.8682 3.91755L13.4279 2.52586ZM14.6437 3.31493C14.2946 2.97594 13.8812 2.70816 13.4279 2.52586L12.8682 3.91755C13.1428 4.02797 13.3909 4.18927 13.5989 4.39117L14.6437 3.31493ZM15.4615 4.50361C15.2712 4.05769 14.993 3.65398 14.6437 3.31493L13.5989 4.39117C13.8068 4.59303 13.9705 4.83147 14.0818 5.09226L15.4615 4.50361ZM15.75 5.9125C15.75 5.4284 15.6518 4.9496 15.4615 4.50361L14.0818 5.09226C14.1931 5.353 14.25 5.63165 14.25 5.9125H15.75ZM9 6.6625L15 6.6625V5.1625L9 5.1625V6.6625ZM9.25 12.7083V16.5917H10.75V12.7083H9.25ZM13.25 12.7083V16.5917H14.75V12.7083H13.25Z"
                    fill="white"
                  />
                </svg>
              </div>
              <textarea
                onChange={(e) => editQuestion("pregunta", e.target.value, i)}
                value={question.pregunta}
                placeholder="Pregunta abierta"
                className={styles.questionInput}
              ></textarea>
            </div>
          ) : (
            <div key={question.id} className={styles.multipleQuestionBox}>
              <div
                onClick={() => deleteQuestion(i)}
                className={styles.deleteBtn}
              >
                <svg
                  width="40px"
                  height="40px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.29802 12.6172L6.03847 12.7365L5.29802 12.6172ZM6.62639 9.77989L6.75843 9.04161L6.33817 8.96645L6.05898 9.28944L6.62639 9.77989ZM5.26042 12.8505L4.51997 12.7312H4.51997L5.26042 12.8505ZM5.45105 16.0429L4.73 16.2492H4.73L5.45105 16.0429ZM5.5687 16.454L6.28976 16.2477H6.28976L5.5687 16.454ZM10.595 20.8812L10.469 21.6205L10.469 21.6205L10.595 20.8812ZM13.4049 20.8812L13.531 21.6205L13.4049 20.8812ZM18.4313 16.454L17.7102 16.2477V16.2477L18.4313 16.454ZM18.5489 16.0429L19.27 16.2492L18.5489 16.0429ZM18.7396 12.8505L19.48 12.7312V12.7312L18.7396 12.8505ZM18.702 12.6172L17.9615 12.7365L18.702 12.6172ZM17.3736 9.77989L17.941 9.28944L17.6618 8.96645L17.2416 9.04161L17.3736 9.77989ZM17.5112 9.75496L17.3758 9.01728L17.5112 9.75496ZM6.48878 9.75496L6.6242 9.01728L6.48878 9.75496ZM9 5.9125H8.25V6.6625H9V5.9125ZM9.87868 3.85305L10.4011 4.39117V4.39117L9.87868 3.85305ZM10.8519 3.2217L11.1318 3.91755L10.8519 3.2217ZM13.1481 3.2217L12.8682 3.91755L12.8682 3.91755L13.1481 3.2217ZM14.7716 4.79794L15.4615 4.50361V4.50361L14.7716 4.79794ZM15 5.9125V6.6625L15.75 6.6625V5.9125H15ZM10.75 12.7083C10.75 12.2941 10.4142 11.9583 10 11.9583C9.58579 11.9583 9.25 12.2941 9.25 12.7083H10.75ZM9.25 16.5917C9.25 17.0059 9.58579 17.3417 10 17.3417C10.4142 17.3417 10.75 17.0059 10.75 16.5917H9.25ZM14.75 12.7083C14.75 12.2941 14.4142 11.9583 14 11.9583C13.5858 11.9583 13.25 12.2941 13.25 12.7083H14.75ZM13.25 16.5917C13.25 17.0059 13.5858 17.3417 14 17.3417C14.4142 17.3417 14.75 17.0059 14.75 16.5917H13.25ZM6.03847 12.7365C6.18791 11.809 6.59553 10.9625 7.19381 10.2703L6.05898 9.28944C5.28502 10.1848 4.75279 11.2863 4.55757 12.4979L6.03847 12.7365ZM6.00087 12.9698L6.03847 12.7365L4.55757 12.4979L4.51997 12.7312L6.00087 12.9698ZM6.17211 15.8365C5.90508 14.9034 5.84678 13.9262 6.00087 12.9698L4.51997 12.7312C4.33081 13.9052 4.4025 15.1048 4.73 16.2492L6.17211 15.8365ZM6.28976 16.2477L6.17211 15.8365L4.73 16.2492L4.84765 16.6604L6.28976 16.2477ZM10.7211 20.1418C8.58113 19.777 6.86392 18.254 6.28976 16.2477L4.84765 16.6604C5.58591 19.2401 7.78001 21.1621 10.469 21.6205L10.7211 20.1418ZM13.2789 20.1418C12.4328 20.2861 11.5672 20.2861 10.7211 20.1418L10.469 21.6205C11.4819 21.7932 12.518 21.7932 13.531 21.6205L13.2789 20.1418ZM17.7102 16.2477C17.1361 18.254 15.4188 19.777 13.2789 20.1418L13.531 21.6205C16.22 21.1621 18.4141 19.2401 19.1523 16.6604L17.7102 16.2477ZM17.8279 15.8365L17.7102 16.2477L19.1523 16.6604L19.27 16.2492L17.8279 15.8365ZM17.9991 12.9698C18.1532 13.9262 18.0949 14.9034 17.8279 15.8365L19.27 16.2492C19.5975 15.1048 19.6692 13.9052 19.48 12.7312L17.9991 12.9698ZM17.9615 12.7365L17.9991 12.9698L19.48 12.7312L19.4424 12.4979L17.9615 12.7365ZM16.8062 10.2703C17.4045 10.9625 17.8121 11.809 17.9615 12.7365L19.4424 12.4979C19.2472 11.2863 18.715 10.1848 17.941 9.28944L16.8062 10.2703ZM17.2416 9.04161C13.7764 9.6613 10.2236 9.6613 6.75843 9.04161L6.49436 10.5182C10.1342 11.1691 13.8658 11.1691 17.5056 10.5182L17.2416 9.04161ZM7.01045 6.6625H16.9895V5.1625H7.01045V6.6625ZM18.25 7.86432V8.01068H19.75V7.86432H18.25ZM5.75 8.01068V7.86432H4.25V8.01068H5.75ZM17.3758 9.01728C13.8235 9.66941 10.1765 9.66941 6.6242 9.01728L6.35336 10.4926C10.0848 11.1776 13.9152 11.1776 17.6466 10.4926L17.3758 9.01728ZM4.25 8.01068C4.25 9.24128 5.14914 10.2716 6.35336 10.4926L6.6242 9.01728C6.10132 8.9213 5.75 8.48652 5.75 8.01068H4.25ZM18.25 8.01068C18.25 8.48652 17.8987 8.9213 17.3758 9.01728L17.6466 10.4926C18.8509 10.2716 19.75 9.24129 19.75 8.01068H18.25ZM16.9895 6.6625C17.7068 6.6625 18.25 7.22135 18.25 7.86432H19.75C19.75 6.35138 18.493 5.1625 16.9895 5.1625V6.6625ZM7.01045 5.1625C5.50698 5.1625 4.25 6.35138 4.25 7.86432H5.75C5.75 7.22135 6.29324 6.6625 7.01045 6.6625V5.1625ZM8.53853 4.50361C8.34824 4.94959 8.25 5.4284 8.25 5.9125H9.75C9.75 5.63165 9.80695 5.353 9.9182 5.09226L8.53853 4.50361ZM9.35626 3.31493C9.00703 3.65398 8.72878 4.05769 8.53853 4.50361L9.9182 5.09226C10.0295 4.83146 10.1932 4.59303 10.4011 4.39117L9.35626 3.31493ZM10.5721 2.52586C10.1188 2.70816 9.70544 2.97594 9.35626 3.31493L10.4011 4.39117C10.6091 4.18927 10.8572 4.02797 11.1318 3.91755L10.5721 2.52586ZM12 2.25C11.5106 2.25 11.0254 2.34356 10.5721 2.52586L11.1318 3.91755C11.4064 3.80711 11.7015 3.75 12 3.75V2.25ZM13.4279 2.52586C12.9746 2.34356 12.4894 2.25 12 2.25V3.75C12.2985 3.75 12.5936 3.80711 12.8682 3.91755L13.4279 2.52586ZM14.6437 3.31493C14.2946 2.97594 13.8812 2.70816 13.4279 2.52586L12.8682 3.91755C13.1428 4.02797 13.3909 4.18927 13.5989 4.39117L14.6437 3.31493ZM15.4615 4.50361C15.2712 4.05769 14.993 3.65398 14.6437 3.31493L13.5989 4.39117C13.8068 4.59303 13.9705 4.83147 14.0818 5.09226L15.4615 4.50361ZM15.75 5.9125C15.75 5.4284 15.6518 4.9496 15.4615 4.50361L14.0818 5.09226C14.1931 5.353 14.25 5.63165 14.25 5.9125H15.75ZM9 6.6625L15 6.6625V5.1625L9 5.1625V6.6625ZM9.25 12.7083V16.5917H10.75V12.7083H9.25ZM13.25 12.7083V16.5917H14.75V12.7083H13.25Z"
                    fill="white"
                  />
                </svg>
              </div>
              <textarea
                onChange={(e) => editQuestion("pregunta", e.target.value, i)}
                value={question.pregunta}
                placeholder="Pregunta"
                className={styles.questionInput}
              ></textarea>
              <div className={styles.multipleQuestionAnswerBox}>
                <textarea
                  onChange={(e) => editQuestion("correcta", e.target.value, i)}
                  value={question.correcta}
                  placeholder="Respuesta Correcta"
                  className={styles.answerInput}
                ></textarea>
                <textarea
                  onChange={(e) => editQuestion("señuelo1", e.target.value, i)}
                  value={question.señuelo1}
                  placeholder="Respuesta señuelo"
                  className={styles.answerInput}
                ></textarea>
                <textarea
                  onChange={(e) => editQuestion("señuelo2", e.target.value, i)}
                  value={question.señuelo2}
                  placeholder="Respuesta señuelo"
                  className={styles.answerInput}
                ></textarea>
                <textarea
                  onChange={(e) => editQuestion("señuelo3", e.target.value, i)}
                  value={question.señuelo3}
                  placeholder="Respuesta señuelo"
                  className={styles.answerInput}
                ></textarea>
              </div>
            </div>
          )
        )}
        <div className={styles.createQuestionBox}>
          <div className={styles.inputBox}>
            <label>Tipo de pregunta</label>
            <select
              className={styles.dropdown}
              value={typeOfQuestionSelected}
              name="question"
              id="question"
              onChange={(e) => setTypeOfQuestionSelected(e.target.value)}
            >
              <option value="multiple">Selección múltiple</option>
              <option value="open">Pregunta abierta</option>
            </select>
          </div>
          <div onClick={() => createQuestion()} className={styles.btn}>
            Crear Pregunta
          </div>
        </div>
      </div>
      <div
        onClick={submitting ? undefined : submitEvaluationTest}
        className={`${styles.createQuestionBtn} ${styles.btn} ${
          submitting ? "cursor-default" : "submitEvaluationTest"
        }`}
      >
        Crear Evaluación
      </div>
    </main>
  );
}