import Link from "next/link";
import styles from "./styles.module.css";
import React from "react";

export default function Instructions({
  timeLimit,
  id,
}: {
  timeLimit?: string | number;
  id: string;
}) {
  return (
    <main className={styles.main}>
      <div className={styles.instructionsBox}>
        <h2>Instrucciones:</h2>
        <ol>
          <li>
            Asegúrate de tener una conexión a internet estable antes de comenzar
            la evaluación.
          </li>
          <li>Lee todas las preguntas cuidadosamente antes de responder.</li>
          <li>Usa el navegador recomendado para evitar problemas técnicos.</li>
          <li>
            No actualices ni cierres la ventana del navegador durante la
            evaluación.
          </li>
          <li>
            No se permite el uso de dispositivos adicionales o programas
            externos.
          </li>
          {/*     <li>
          Tienes {timeLimit} minutos para completar la evaluación, que
          comenzarán a contar una vez que inicies.
        </li> */}
          <li>
            Al finalizar, revisa tus respuestas y asegúrate de enviarlas antes
            de que se acabe el tiempo.
          </li>
        </ol>
      </div>
      <Link className={styles.btn} href={`/evaluation/${id}`}>
        Comenzar Prueba
      </Link>
    </main>
  );
}
