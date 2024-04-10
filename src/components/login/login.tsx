import styles from "./styles.module.css";
import { useState } from "react";
export default function Login() {
  const [inputName, setInputName] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  return (
    <main className={styles.main}>
      <div className={styles.loginBox}>
        <label>Name</label>
        <input
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          type="text"
        ></input>
        <label>password</label>
        <input
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          type="password"
        ></input>
        <button>Iniciar Sesion</button>
      </div>
    </main>
  );
}
