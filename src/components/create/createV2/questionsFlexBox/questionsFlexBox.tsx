import { ChangeEvent, Dispatch, SetStateAction } from "react";
import styles from "./styles.module.css";
import { QuestionWithError } from "@/components/create/createV2/createV2";
import { FilePDF } from "@/models/evaluationTest";
import { Answers } from "@/components/inEvaluation/inEvaluationV2/inEvaluationV2";

export default function QuestionsFlexBox({
  tabSelected,
  setTabSelected,
  questionLength,
  createQuestion,
  submitting,
  submitEvaluationTest,
  uploadPdf,
  uploadFileGuideError,
  filesArr,
  fileSelected,
  editQuestion,
  removeFilePDF,
  id,
  answers,
}: {
  tabSelected: string;
  setTabSelected: Dispatch<SetStateAction<string>>;
  questionLength: number;
  createQuestion?: () => void;
  submitting?: boolean;
  submitEvaluationTest?: () => void;
  uploadPdf?: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploadFileGuideError?: string;
  filesArr?: FilePDF[];
  fileSelected?: number | null | undefined;
  editQuestion?: (
    property: keyof QuestionWithError,
    value: string | number,
    index: number
  ) => void;
  removeFilePDF?: (fileIndex: number) => void;
  id?: string;
  answers?: boolean[];
}) {
  return (
    <aside className={styles.questionsBox}>
      {filesArr && (
        <>
          <div
            onClick={() => {
              setTabSelected("general");
            }}
            className={`${styles.generalBtn} ${styles.question} ${
              tabSelected === "general" ? styles.choose : ""
            }`}
          >
            Informacion General
          </div>
        </>
      )}
      <h2>Preguntas</h2>
      <ul className={styles.questionsList}>
        {[...Array(questionLength)].map((_, i) => (
          <li
            onClick={() => {
              setTabSelected(i.toString());
            }}
            key={i}
            className={`${styles.question} ${
              tabSelected === i.toString()
                ? styles.choose
                : answers && answers[i] && styles.answered
            }`}
          >
            {i + 1}
          </li>
        ))}
        {filesArr && (
          <li
            onClick={createQuestion}
            className={`${styles.question} ${styles.add}`}
          >
            <svg
              viewBox="0 0 32 32"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
              width={"14px"}
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <g
                  id="Page-1"
                  stroke="none"
                  strokeWidth="1"
                  fill="none"
                  fillRule="evenodd"
                >
                  <g
                    id="Icon-Set-Filled"
                    transform="translate(-362.000000, -1037.000000)"
                    fill="white"
                  >
                    <path
                      d="M390,1049 L382,1049 L382,1041 C382,1038.79 380.209,1037 378,1037 C375.791,1037 374,1038.79 374,1041 L374,1049 L366,1049 C363.791,1049 362,1050.79 362,1053 C362,1055.21 363.791,1057 366,1057 L374,1057 L374,1065 C374,1067.21 375.791,1069 378,1069 C380.209,1069 382,1067.21 382,1065 L382,1057 L390,1057 C392.209,1057 394,1055.21 394,1053 C394,1050.79 392.209,1049 390,1049"
                      id="plus"
                    ></path>
                  </g>
                </g>
              </g>
            </svg>
          </li>
        )}
      </ul>
      {tabSelected && editQuestion && filesArr && removeFilePDF && (
        <>
          <button
            onClick={submitting ? undefined : submitEvaluationTest}
            className={`${styles.createQuestionBtn} ${styles.btn} ${
              submitting ? "cursor-default" : "submitEvaluationTest"
            }`}
          >
            Guardar Evaluación
          </button>
          {/*       <h2>Preguntas</h2>
           */}
          <label
            className={`${styles.btnEventPDF} ${styles.btn}`}
            htmlFor="eventPDF"
          >
            Subir Archivo PDF
          </label>
          {uploadFileGuideError !== "" && (
            <p className={styles.error}>{uploadFileGuideError}</p>
          )}
          <input
            accept="application/pdf"
            className={styles.inputEventPDF}
            type="file"
            name="eventPDF"
            id="eventPDF"
            onChange={uploadPdf}
          />
          <ul className={styles.filesList}>
            <li className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <input
                  type="radio"
                  id={`fileNone`}
                  name={`filePDF`}
                  value={-1}
                  disabled={tabSelected === "general"}
                  checked={
                    tabSelected === "general" ? false : fileSelected === -1
                  }
                  onChange={(e) =>
                    editQuestion(
                      "fileSelected",
                      parseInt(e.target.value, 10),
                      parseInt(tabSelected, 10)
                    )
                  }
                />
                <label htmlFor={`fileNone`}>Ninguno</label>
              </div>
            </li>
            {filesArr.map((file, i) => (
              <li className={styles.fileItem} key={i}>
                <div className={styles.fileInfo}>
                  <input
                    type="radio"
                    id={`file${i}`}
                    name={`filePDF`}
                    value={i}
                    disabled={tabSelected === "general"}
                    checked={
                      tabSelected === "general" ? false : fileSelected === i
                    }
                    onChange={(e) =>
                      editQuestion(
                        "fileSelected",
                        parseInt(e.target.value, 10),
                        parseInt(tabSelected, 10)
                      )
                    }
                  />
                  <label htmlFor={`file${i}`}>
                    {file.name}
                    {/*{file._id}*/}
                  </label>
                </div>
                <svg
                  onClick={() => {
                    removeFilePDF(i);
                  }}
                  width="28px"
                  height="28px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.29802 12.6172L6.03847 12.7365L5.29802 12.6172ZM6.62639 9.77989L6.75843 9.04161L6.33817 8.96645L6.05898 9.28944L6.62639 9.77989ZM5.26042 12.8505L4.51997 12.7312H4.51997L5.26042 12.8505ZM5.45105 16.0429L4.73 16.2492H4.73L5.45105 16.0429ZM5.5687 16.454L6.28976 16.2477H6.28976L5.5687 16.454ZM10.595 20.8812L10.469 21.6205L10.469 21.6205L10.595 20.8812ZM13.4049 20.8812L13.531 21.6205L13.4049 20.8812ZM18.4313 16.454L17.7102 16.2477V16.2477L18.4313 16.454ZM18.5489 16.0429L19.27 16.2492L18.5489 16.0429ZM18.7396 12.8505L19.48 12.7312V12.7312L18.7396 12.8505ZM18.702 12.6172L17.9615 12.7365L18.702 12.6172ZM17.3736 9.77989L17.941 9.28944L17.6618 8.96645L17.2416 9.04161L17.3736 9.77989ZM17.5112 9.75496L17.3758 9.01728L17.5112 9.75496ZM6.48878 9.75496L6.6242 9.01728L6.48878 9.75496ZM9 5.9125H8.25V6.6625H9V5.9125ZM9.87868 3.85305L10.4011 4.39117V4.39117L9.87868 3.85305ZM10.8519 3.2217L11.1318 3.91755L10.8519 3.2217ZM13.1481 3.2217L12.8682 3.91755L12.8682 3.91755L13.1481 3.2217ZM14.7716 4.79794L15.4615 4.50361V4.50361L14.7716 4.79794ZM15 5.9125V6.6625L15.75 6.6625V5.9125H15ZM10.75 12.7083C10.75 12.2941 10.4142 11.9583 10 11.9583C9.58579 11.9583 9.25 12.2941 9.25 12.7083H10.75ZM9.25 16.5917C9.25 17.0059 9.58579 17.3417 10 17.3417C10.4142 17.3417 10.75 17.0059 10.75 16.5917H9.25ZM14.75 12.7083C14.75 12.2941 14.4142 11.9583 14 11.9583C13.5858 11.9583 13.25 12.2941 13.25 12.7083H14.75ZM13.25 16.5917C13.25 17.0059 13.5858 17.3417 14 17.3417C14.4142 17.3417 14.75 17.0059 14.75 16.5917H13.25ZM6.03847 12.7365C6.18791 11.809 6.59553 10.9625 7.19381 10.2703L6.05898 9.28944C5.28502 10.1848 4.75279 11.2863 4.55757 12.4979L6.03847 12.7365ZM6.00087 12.9698L6.03847 12.7365L4.55757 12.4979L4.51997 12.7312L6.00087 12.9698ZM6.17211 15.8365C5.90508 14.9034 5.84678 13.9262 6.00087 12.9698L4.51997 12.7312C4.33081 13.9052 4.4025 15.1048 4.73 16.2492L6.17211 15.8365ZM6.28976 16.2477L6.17211 15.8365L4.73 16.2492L4.84765 16.6604L6.28976 16.2477ZM10.7211 20.1418C8.58113 19.777 6.86392 18.254 6.28976 16.2477L4.84765 16.6604C5.58591 19.2401 7.78001 21.1621 10.469 21.6205L10.7211 20.1418ZM13.2789 20.1418C12.4328 20.2861 11.5672 20.2861 10.7211 20.1418L10.469 21.6205C11.4819 21.7932 12.518 21.7932 13.531 21.6205L13.2789 20.1418ZM17.7102 16.2477C17.1361 18.254 15.4188 19.777 13.2789 20.1418L13.531 21.6205C16.22 21.1621 18.4141 19.2401 19.1523 16.6604L17.7102 16.2477ZM17.8279 15.8365L17.7102 16.2477L19.1523 16.6604L19.27 16.2492L17.8279 15.8365ZM17.9991 12.9698C18.1532 13.9262 18.0949 14.9034 17.8279 15.8365L19.27 16.2492C19.5975 15.1048 19.6692 13.9052 19.48 12.7312L17.9991 12.9698ZM17.9615 12.7365L17.9991 12.9698L19.48 12.7312L19.4424 12.4979L17.9615 12.7365ZM16.8062 10.2703C17.4045 10.9625 17.8121 11.809 17.9615 12.7365L19.4424 12.4979C19.2472 11.2863 18.715 10.1848 17.941 9.28944L16.8062 10.2703ZM17.2416 9.04161C13.7764 9.6613 10.2236 9.6613 6.75843 9.04161L6.49436 10.5182C10.1342 11.1691 13.8658 11.1691 17.5056 10.5182L17.2416 9.04161ZM7.01045 6.6625H16.9895V5.1625H7.01045V6.6625ZM18.25 7.86432V8.01068H19.75V7.86432H18.25ZM5.75 8.01068V7.86432H4.25V8.01068H5.75ZM17.3758 9.01728C13.8235 9.66941 10.1765 9.66941 6.6242 9.01728L6.35336 10.4926C10.0848 11.1776 13.9152 11.1776 17.6466 10.4926L17.3758 9.01728ZM4.25 8.01068C4.25 9.24128 5.14914 10.2716 6.35336 10.4926L6.6242 9.01728C6.10132 8.9213 5.75 8.48652 5.75 8.01068H4.25ZM18.25 8.01068C18.25 8.48652 17.8987 8.9213 17.3758 9.01728L17.6466 10.4926C18.8509 10.2716 19.75 9.24129 19.75 8.01068H18.25ZM16.9895 6.6625C17.7068 6.6625 18.25 7.22135 18.25 7.86432H19.75C19.75 6.35138 18.493 5.1625 16.9895 5.1625V6.6625ZM7.01045 5.1625C5.50698 5.1625 4.25 6.35138 4.25 7.86432H5.75C5.75 7.22135 6.29324 6.6625 7.01045 6.6625V5.1625ZM8.53853 4.50361C8.34824 4.94959 8.25 5.4284 8.25 5.9125H9.75C9.75 5.63165 9.80695 5.353 9.9182 5.09226L8.53853 4.50361ZM9.35626 3.31493C9.00703 3.65398 8.72878 4.05769 8.53853 4.50361L9.9182 5.09226C10.0295 4.83146 10.1932 4.59303 10.4011 4.39117L9.35626 3.31493ZM10.5721 2.52586C10.1188 2.70816 9.70544 2.97594 9.35626 3.31493L10.4011 4.39117C10.6091 4.18927 10.8572 4.02797 11.1318 3.91755L10.5721 2.52586ZM12 2.25C11.5106 2.25 11.0254 2.34356 10.5721 2.52586L11.1318 3.91755C11.4064 3.80711 11.7015 3.75 12 3.75V2.25ZM13.4279 2.52586C12.9746 2.34356 12.4894 2.25 12 2.25V3.75C12.2985 3.75 12.5936 3.80711 12.8682 3.91755L13.4279 2.52586ZM14.6437 3.31493C14.2946 2.97594 13.8812 2.70816 13.4279 2.52586L12.8682 3.91755C13.1428 4.02797 13.3909 4.18927 13.5989 4.39117L14.6437 3.31493ZM15.4615 4.50361C15.2712 4.05769 14.993 3.65398 14.6437 3.31493L13.5989 4.39117C13.8068 4.59303 13.9705 4.83147 14.0818 5.09226L15.4615 4.50361ZM15.75 5.9125C15.75 5.4284 15.6518 4.9496 15.4615 4.50361L14.0818 5.09226C14.1931 5.353 14.25 5.63165 14.25 5.9125H15.75ZM9 6.6625L15 6.6625V5.1625L9 5.1625V6.6625ZM9.25 12.7083V16.5917H10.75V12.7083H9.25ZM13.25 12.7083V16.5917H14.75V12.7083H13.25Z"
                    fill="var(--primary-red)"
                  />
                </svg>
              </li>
            ))}
          </ul>
        </>
      )}

      {/*       <p className={styles.info}>Click derecho para borrar pregunta</p>
       */}
    </aside>
  );
}
