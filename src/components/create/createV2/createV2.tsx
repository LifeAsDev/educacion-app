"use client";
import QuestionsFlexBox from "@/components/create/createV2/questionsFlexBox/questionsFlexBox";
import styles from "./styles.module.css";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import Question from "@/models/question";
import { v4 as uuidv4 } from "uuid"; // Importa la función uuidv4
import { useRouter } from "next/navigation";
import { useOnboardingContext } from "@/lib/context";
import Asignatura from "@/models/asignatura";
import SetQuestion from "@/components/create/createV2/setQuestion/setQuestion";
import SetEvaluationGeneral from "@/components/create/createV2/setEvaluationGeneral/setEvaluationGeneral";
import EvaluationInfoViewer from "@/components/create/createV2/evaluationInfoViewer/evaluationInfoViewer";
import { FilePDF } from "@/models/evaluationTest";

export interface QuestionWithError extends Question {
  error?: string;
}

export default function CreateV2({ id }: { id?: string }) {
  const [tabSelected, setTabSelected] = useState("general");
  const [typeOfQuestionSelected, setTypeOfQuestionSelected] =
    useState("multiple");
  const { session } = useOnboardingContext();
  const router = useRouter();
  const [editFetch, setEditFetch] = useState(true);
  const [questionArr, setQuestionArr] = useState<QuestionWithError[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("Formativa");
  const [difficulty, setDifficulty] = useState("Básico");
  const [submitting, setSubmitting] = useState(false);
  const [questionErrorArr, setQuestionErrorArr] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [asignatura, setAsignatura] = useState<string>("N/A");
  const [asignaturasArr, setAsignaturasArr] = useState<Asignatura[]>([]);
  const [tiempo, setTiempo] = useState<number>(90);
  const [nivel, setNivel] = useState("1° Basico");
  const [uploadFileGuideError, setUploadFileGuideError] = useState("");
  const [filesArr, setFilesArr] = useState<FilePDF[]>([]);

  const editQuestion = (
    property: keyof QuestionWithError,
    value: string | number,
    index: number
  ) => {
    const newQuestion: any[] = [...questionArr];
    if (property !== "image") newQuestion[index][property] = value;

    setQuestionArr(newQuestion);
    setQuestionErrorArr([]);
    setErrors([]);
  };

  const createQuestion = () => {
    let newQuestion: Question;
    if (typeOfQuestionSelected === "open") {
      newQuestion = {
        type: "open",
        pregunta: "",
        id: uuidv4(),
        image: null,
        puntos: 1,
        openAnswers: [],
      };
    } else if (typeOfQuestionSelected === "multiple") {
      newQuestion = {
        type: "multiple",
        pregunta: "",
        correcta: "",
        señuelo1: "",
        señuelo2: "",
        señuelo3: "",
        id: uuidv4(),
        image: null,
        puntos: 1,
        openAnswers: [],
      };
    }

    setQuestionArr((prev) => [...prev, newQuestion]);
    setTabSelected(questionArr.length.toString());
  };

  const deleteQuestion = (questionIndex: number) => {
    if (questionIndex === 0 && questionArr.length === 1) {
      setTabSelected("general");
    } else if (questionIndex >= questionArr.length - 1) {
      setTabSelected((questionIndex - 1).toString());
    }
    const newQuestionArr = [...questionArr];
    newQuestionArr.splice(questionIndex, 1);
    setQuestionArr(newQuestionArr);
  };

  useEffect(() => {
    const fetchAsignaturas = async () => {
      try {
        const response = await fetch(`/api/asignatura`, {
          method: "GET",
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error("Failed to fetch evaluation test");
        }

        setAsignaturasArr(data.asignaturas);

        return data.asignaturas;
      } catch (error) {
        console.error("Error fetching evaluation test:", error);
        return null;
      }
    };
    fetchAsignaturas();
  }, []);

  const cache = useRef(false);
  useEffect(() => {
    const cachedState = localStorage.getItem("createState");
    if (cachedState && !cache.current && !id) {
      setEditFetch(false);

      cache.current = true;
      const parseCachedState = JSON.parse(cachedState);
      if (parseCachedState.questionArr) {
        // Convertir los datos de imagen a Buffer si es necesario
        const questionsWithBuffer = parseCachedState.questionArr.map(
          (question: Question) => {
            if (
              typeof question.image !== "string" &&
              question.image !== null &&
              typeof question.image !== "undefined" &&
              "type" in question.image &&
              question.image.type === "Buffer"
            ) {
              return {
                ...question,
                image: Buffer.from(question.image.data),
              };
            }
            return question;
          }
        );

        setQuestionArr(questionsWithBuffer);
      } // Convert filesArr if necessary
      const filesWithBuffer = parseCachedState.filesArr.map(
        (fileObj: FilePDF) => {
          if (
            fileObj.file !== null &&
            typeof fileObj.file !== "string" &&
            "type" in fileObj.file &&
            fileObj.file.type === "Buffer"
          ) {
            return {
              ...fileObj,
              file: Buffer.from(fileObj.file.data),
            };
          }
          return fileObj;
        }
      );
      setFilesArr(filesWithBuffer);

      setName(parseCachedState.name);
      setType(parseCachedState.type);
      setDifficulty(parseCachedState.difficulty);
      setAsignatura(parseCachedState.asignatura);
      setNivel(parseCachedState.nivel);
      setTiempo(parseCachedState.tiempo);
    } else if (!cache.current) {
      setEditFetch(false);
    }
    if (id) {
      cache.current = true;

      setEditFetch(true);
      const fetchEvaluationTest = async (id: string) => {
        try {
          const response = await fetch(`/api/evaluation-test/${id}`, {
            method: "GET",
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error("Failed to fetch evaluation test");
          }
          setName(data.evaluationTest.name);
          setQuestionArr(data.evaluationTest.questionArr);
          setFilesArr(data.evaluationTest.files);
          setType(data.evaluationTest.type);
          setDifficulty(data.evaluationTest.difficulty);
          setEditFetch(false);
          setAsignatura(data.evaluationTest.asignatura?._id ?? "N/A");
          setTiempo(data.evaluationTest.tiempo ?? 90);
          if (data.evaluationTest.nivel) {
            setNivel(data.evaluationTest.nivel);
          }

          return data.evaluationTest;
        } catch (error) {
          router.push(`/evaluation`);
          console.error("Error fetching evaluation test:", error);
          return null;
        }
      };
      fetchEvaluationTest(id);
    }
  }, [id, router]);

  useEffect(() => {
    if (submitting) {
      localStorage.removeItem("createState");
    }
  }, [
    asignatura,
    difficulty,
    id,
    name,
    questionArr,
    submitting,
    type,
    tiempo,
    nivel,
    filesArr,
  ]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!submitting && !id) {
        localStorage.setItem(
          "createState",
          JSON.stringify({
            questionArr,
            name,
            type,
            difficulty,
            asignatura,
            tiempo,
            nivel,
            filesArr,
          })
        );
      }
    }, 10000); // Ejecuta cada 10 segundos

    // Limpia el intervalo al desmontar el componente o cuando cambien las dependencias
    return () => {
      clearInterval(intervalId);
    };
  }, [
    asignatura,
    difficulty,
    id,
    name,
    questionArr,
    submitting,
    type,
    tiempo,
    nivel,
    filesArr,
  ]);

  const submitEvaluationTest = () => {
    const newQuestionErrorArr: string[] = [];
    const newErrors: string[] = [];
    questionArr.forEach((question) => {
      var regex = /(<([^>]+)>)/gi;

      if (question.type === "multiple") {
        if (
          !question.pregunta!.replace(regex, "").length ||
          !question.correcta!.replace(regex, "").length ||
          !question.señuelo1!.replace(regex, "").length ||
          !question.señuelo2!.replace(regex, "").length ||
          !question.señuelo3!.replace(regex, "").length
        ) {
          newQuestionErrorArr.push("error");
        } else {
          newQuestionErrorArr.push("good");
        }
      }
      if (question.type === "open") {
        if (!question.pregunta.replace(regex, "").length) {
          newQuestionErrorArr.push("error");
        } else {
          newQuestionErrorArr.push("good");
        }
      }
    });
    setQuestionErrorArr(newQuestionErrorArr);
    setErrors([]);
    if (name === "") {
      newErrors.push("name");
    }

    setErrors(newErrors);

    if (
      newQuestionErrorArr.some((question) => question === "error") ||
      newErrors.length > 0
    ) {
      if (newQuestionErrorArr.some((question) => question === "error")) {
        const errorIndex = newQuestionErrorArr.findIndex(
          (question) => question === "error"
        );

        if (errorIndex !== -1) {
          setTabSelected(errorIndex.toString());
        }
      } else {
        setTabSelected("general");
      }
      return;
    } else {
      setSubmitting(true);
      const fetchSubmit = async () => {
        function bufferToFile(buffer: Buffer, fileName: string): File {
          const arrayBuffer = buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength
          );
          const blob = new Blob([arrayBuffer], {
            type: "application/octet-stream",
          });
          return new File([blob], fileName, {
            type: "application/octet-stream",
          });
        }
        try {
          const data = new FormData();
          data.set("name", name as string);
          data.set("type", type as string);
          data.set("difficulty", difficulty as string);
          data.set("asignatura", asignatura as string);
          data.set("creatorId", session._id as string);
          data.set("time", tiempo.toString());
          data.set("nivel", nivel as string);
          data.set(
            "questionArr",
            JSON.stringify(
              questionArr.map((question) => {
                const newQuestion = { ...question };
                newQuestion.image = null;
                return newQuestion;
              })
            )
          );

          questionArr.forEach((question, index) => {
            const newQuestion = { ...question };

            if (question.image instanceof Buffer) {
              const file = bufferToFile(
                question.image,
                `question-image-${index}`
              );
              data.append(`image-${index}`, file);
            } else if (typeof question.image === "string") {
              data.append(`image-${index}`, question.image);
            } else {
              data.append(`image-${index}`, "null");
            }
          });

          filesArr.forEach((file) => {
            const fileString = JSON.stringify(file);
            data.append("files", fileString);
          });

          const res = await fetch("/api/evaluation-test/test", {
            method: "POST",
            body: data,
          });
          const resData = await res.json();

          if (res.ok) {
            localStorage.removeItem("createState");
            router.push(`/edit/${resData.id}`);
            return true;
          } else {
            return;
          }
        } catch (error) {
          return;
        }
      };
      const fetchSubmitPatch = async () => {
        try {
          const data = new FormData();
          data.set("name", name as string);
          data.set("type", type as string);
          data.set("difficulty", difficulty as string);
          data.set("asignatura", asignatura as string);
          data.set("creatorId", session._id as string);
          data.set("time", tiempo.toString());
          data.set("nivel", nivel);
          data.set("questionArr", JSON.stringify(questionArr));
          filesArr.forEach((file) => {
            const fileString = JSON.stringify(file);
            data.append("files", fileString);
          });

          const res = await fetch(`/api/evaluation-test/${id}`, {
            method: "PATCH",
            body: data,
          });
          const resData = await res.json();
          setSubmitting(false);

          if (res.ok) {
            setName(resData.updatedEvaluationTest.name);
            setQuestionArr(resData.updatedEvaluationTest.questionArr);
            setFilesArr(resData.updatedEvaluationTest.files);
            setType(resData.updatedEvaluationTest.type);
            setDifficulty(resData.updatedEvaluationTest.difficulty);
            setAsignatura(
              resData.updatedEvaluationTest.asignatura?._id ?? "N/A"
            );
            setTiempo(resData.updatedEvaluationTest.tiempo ?? 90);
            if (resData.updatedEvaluationTest.nivel) {
              setNivel(resData.updatedEvaluationTest.nivel);
            }
            return true;
          } else {
            return;
          }
        } catch (error) {
          return;
        }
      };
      if (!id) fetchSubmit();
      else fetchSubmitPatch();
    }
  };

  const refreshImageErrors = () => {
    const newQuestionArr = [...questionArr];
    newQuestionArr.map((question, i) => {
      newQuestionArr[i].error = "";
    });
    setQuestionArr(newQuestionArr);
  };

  const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    let errorsNow = "";
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const file = e.target.files?.[0];
    const maxSizeMB = 3;
    const maxWidth = 1600;
    const maxHeight = 1024;
    refreshImageErrors();

    if (!file || !file.type.startsWith("image/")) {
      errorsNow = "Por favor selecciona una imagen.";
    } else {
      if (!allowedTypes.includes(file.type)) {
        errorsNow = "Solo se permiten imágenes JPEG, PNG o GIF.";
      }

      if (file.size / 1024 / 1024 > maxSizeMB) {
        errorsNow = `La imagen debe ser más pequeña que ${maxSizeMB}MB.`;
      }

      try {
        await new Promise<void>((resolve, reject) => {
          const imageElement = new Image();
          imageElement.onload = function () {
            if (
              imageElement.width > maxWidth ||
              imageElement.height > maxHeight
            ) {
              errorsNow = `La imagen debe ser más pequeña que ${maxWidth}x${maxHeight} píxeles.`;
              reject();
            } else {
              resolve();
            }
          };
          imageElement.onerror = function () {
            errorsNow = "Error al cargar la imagen.";
            reject();
          };
          imageElement.src = URL.createObjectURL(file);
        });
      } catch (error) {}
    }

    if (Object.values(errorsNow).length === 0) {
      const bytes = await file!.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const newQuestionArr = [...questionArr];
      const questionIndex = newQuestionArr.findIndex(
        (question) =>
          question._id === e.target.id || question.id === e.target.id
      );

      newQuestionArr[questionIndex].image = buffer;

      setQuestionArr(newQuestionArr);
    } else {
      const newQuestionArr = [...questionArr];
      newQuestionArr[
        newQuestionArr.findIndex(
          (question) =>
            question._id === e.target.id || question.id === e.target.id
        )
      ].error = errorsNow;
      setQuestionArr(newQuestionArr);
      removeSelectedImage(e.target.id, false);
    }
  };

  const removeSelectedImage = (id: string, refresh: boolean = true) => {
    let fileInput = document.getElementById(id);
    if (refresh) refreshImageErrors();
    if (fileInput instanceof HTMLInputElement) {
      fileInput.value = "";
      fileInput.dispatchEvent(new Event("change"));
    }

    const newQuestionArr = [...questionArr];
    const questionIndex = newQuestionArr.findIndex(
      (question) => question._id === id || question.id === id
    );
    if (questionIndex !== -1) newQuestionArr[questionIndex].image = null;

    setQuestionArr(newQuestionArr);
  };

  const uploadPdf = async (e: ChangeEvent<HTMLInputElement>) => {
    let errorsNow = "";
    const allowedType = "application/pdf";
    const file = e.target.files?.[0];
    const maxSizeMB = 10; // Cambia el tamaño máximo si es necesario
    setUploadFileGuideError("");
    if (!file || file.type !== allowedType) {
      errorsNow = "Por favor selecciona un archivo PDF.";
    } else {
      if (file.size / 1024 / 1024 > maxSizeMB) {
        errorsNow = `El archivo debe ser más pequeño que ${maxSizeMB}MB.`;
      }
    }

    if (errorsNow === "") {
      const bytes = await file!.arrayBuffer();
      const buffer = Buffer.from(bytes);
      setFilesArr((prev) => [
        ...prev,
        { file: buffer, name: file?.name ?? "Sin Nombre" },
      ]);
    } else {
      setUploadFileGuideError(errorsNow);
    }
    removeSelectedImage(e.target.id, false);
  };

  const removeFilePDF = (fileIndex: number) => {
    setFilesArr((prevFiles) => {
      const newFiles = prevFiles.filter((_, index) => index !== fileIndex);

      setQuestionArr((prevQuestions) =>
        prevQuestions.map((question) => {
          if (question.fileSelected === fileIndex) {
            return { ...question, fileSelected: null };
          } else if (
            question.fileSelected !== null &&
            question.fileSelected !== undefined &&
            question.fileSelected > fileIndex
          ) {
            return { ...question, fileSelected: question.fileSelected - 1 };
          }
          return question;
        })
      );

      return newFiles;
    });
  };

  return (
    <main className={styles.main}>
      {submitting || editFetch ? (
        <div className={styles.submitting}>
          <div className={styles.loader}></div>
          {editFetch
            ? "Obteniendo Datos..."
            : id
            ? "Guardando Evaluación..."
            : "Creando Evaluación..."}
        </div>
      ) : (
        ""
      )}
      <QuestionsFlexBox
        tabSelected={tabSelected}
        setTabSelected={setTabSelected}
        questionLength={questionArr.length}
        createQuestion={createQuestion}
        submitting={submitting}
        submitEvaluationTest={submitEvaluationTest}
        uploadPdf={uploadPdf}
        uploadFileGuideError={uploadFileGuideError}
        filesArr={filesArr}
        fileSelected={
          questionArr[parseInt(tabSelected, 10)]?.fileSelected ?? -1
        }
        editQuestion={editQuestion}
        removeFilePDF={removeFilePDF}
        id={id}
      />
      {tabSelected === "general" ? (
        <SetEvaluationGeneral
          setErrors={setErrors}
          setQuestionErrorArr={setQuestionErrorArr}
          name={name}
          setName={setName}
          errors={errors}
          tiempo={tiempo}
          setTiempo={setTiempo}
          type={type}
          setType={setType}
          nivel={nivel}
          setNivel={setNivel}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          asignatura={asignatura}
          setAsignatura={setAsignatura}
          asignaturasArr={asignaturasArr}
          title={id ? "Editar" : "Crear"}
        />
      ) : (
        <>
          <EvaluationInfoViewer
            evaluationId={id}
            filesArr={filesArr}
            fileSelected={
              questionArr[parseInt(tabSelected, 10)]?.fileSelected ?? -1
            }
          />
          <SetQuestion
            question={questionArr[parseInt(tabSelected, 10)]}
            i={parseInt(tabSelected, 10)}
            removeSelectedImage={removeSelectedImage}
            uploadImage={uploadImage}
            deleteQuestion={deleteQuestion}
            setErrors={setErrors}
            setQuestionErrorArr={setQuestionErrorArr}
            editQuestion={editQuestion}
            questionErrorArr={questionErrorArr}
            typeOfQuestionSelected={typeOfQuestionSelected}
            setTypeOfQuestionSelected={setTypeOfQuestionSelected}
          />
        </>
      )}
    </main>
  );
}
