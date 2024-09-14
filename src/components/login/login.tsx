"use client";
import styles from "./styles.module.css";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [errorSignIn, setErrorSignIn] = useState(false);
  const handleLogin = async () => {
    setErrorSignIn(false);
    try {
      const res = await signIn("credentials", {
        password: inputPassword,
        dni: inputEmail,
        redirect: false,
      });

      if (res?.ok) {
        window.location.reload();
      } else {
        setErrorSignIn(true);
        setLoadingSignIn(false);
      }
    } catch (error) {
      setErrorSignIn(true);
      setLoadingSignIn(false);
    }
  };

  const handleEmailKeyDown = (e: {
    key: string;
    preventDefault: () => void;
  }) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("passwordInput")!.focus();
    }
  };

  const handlePasswordKeyDown = (e: {
    key: string;
    preventDefault: () => void;
  }) => {
    if (e.key === "Enter") {
      setLoadingSignIn(true);
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.loginBox}>
        <label>RUT</label>
        <input
          onFocus={(e) => setErrorSignIn(false)}
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          type="text"
          onKeyDown={handleEmailKeyDown}
        ></input>
        <label>Contraseña</label>
        <input
          onFocus={(e) => setErrorSignIn(false)}
          id="passwordInput"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          type="password"
          onKeyDown={handlePasswordKeyDown}
        ></input>
        {errorSignIn ? (
          <p className={`${styles.error}`}>Credenciales Incorrectas</p>
        ) : (
          ""
        )}
        <button
          className={loadingSignIn ? styles.disable : ""}
          onClick={() => {
            if (!loadingSignIn) {
              setLoadingSignIn(true);
              handleLogin();
            }
          }}
        >
          {loadingSignIn ? (
            <div className={styles.loader}></div>
          ) : (
            "Iniciar Sesion"
          )}
        </button>
      </div>
    </main>
  );
}
