import { Dispatch, SetStateAction } from "react";
import styles from "./styles.module.css";

export default function QuestionsFlexBox({
  tabSelected,
  setTabSelected,
  questionLength,
  createQuestion,
  submitting,
  submitEvaluationTest,
}: {
  tabSelected: string;
  setTabSelected: Dispatch<SetStateAction<string>>;
  questionLength: number;
  createQuestion: () => void;
  submitting: boolean;
  submitEvaluationTest: () => void;
}) {
  return (
    <aside className={styles.questionsBox}>
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
      <h2>Preguntas</h2>
      <ul className={styles.questionsList}>
        {[...Array(questionLength)].map((_, i) => (
          <li
            onClick={() => {
              setTabSelected(i.toString());
            }}
            key={i}
            className={`${styles.question} ${
              tabSelected === i.toString() ? styles.choose : ""
            }`}
          >
            {i + 1}
          </li>
        ))}
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
      </ul>{" "}
      <button
        onClick={submitting ? undefined : submitEvaluationTest}
        className={`${styles.createQuestionBtn} ${styles.btn} ${
          submitting ? "cursor-default" : "submitEvaluationTest"
        }`}
      >
        Guardar Evaluación
      </button>
      {/*       <p className={styles.info}>Click derecho para borrar pregunta</p>
       */}
    </aside>
  );
}
