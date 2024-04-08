import styles from "./styles.module.css";
export default function Login() {
  return (
    <main className={styles.main}>
      <div className={styles.loginBox}>
        <label>Name</label>
        <input type="text"></input>
        <label>password</label>
        <input type="password"></input>
        <button>Iniciar Sesion</button>
      </div>
    </main>
  );
}
