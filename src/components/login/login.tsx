"use client";
import styles from "./styles.module.css";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function Login() {
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      password: inputPassword,
      email: inputEmail,
      redirect: false,
    });
  };
  return (
    <main className={styles.main}>
      <div className={styles.loginBox}>
        <label>Email</label>
        <input
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          type="text"
        ></input>
        <label>Password</label>
        <input
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          type="password"
        ></input>
        <button onClick={handleLogin}>Iniciar Sesion</button>
      </div>
    </main>
  );
}
