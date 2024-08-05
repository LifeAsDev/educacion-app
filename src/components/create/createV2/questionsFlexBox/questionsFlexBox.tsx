import styles from "./styles.module.css";
export default function QuestionsFlexBox() {
  return (
    <div className={styles.questionsBox}>
      <h2>Preguntas</h2>
      <ul className={styles.questionsList}>
        {[...Array(10)].map((_, i) => (
          <li key={i} className={styles.question}>
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
