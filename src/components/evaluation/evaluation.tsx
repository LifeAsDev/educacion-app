import styles from "./styles.module.css";
export default function Evaluation() {
  return (
    <main className={styles.main}>
      <div className={styles.top}>
        <p className={styles.info}>Clase: C</p>
        <p className={styles.info}>Grado: 6</p>
      </div>
      <ul className={styles.testList}>
        <li className={styles.testItem}>
          <p>Prueba 1</p>
        </li>
        <li className={styles.testItem}>
          <p>Prueba 2</p>
        </li>
      </ul>
    </main>
  );
}
