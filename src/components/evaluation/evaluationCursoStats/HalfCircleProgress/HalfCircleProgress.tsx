// components/SemiCircleProgress.tsx
import React from "react";
import styles from "./styles.module.css";

interface Props {
  progress: number; // Valor del progreso entre 0 y 100
}

const SemiCircleProgress: React.FC<Props> = ({ progress }) => {
  const p = 180 - (progress / 100) * 180;

  return (
    <div className={styles.wrapper}>
      <div className={styles.circleOut}>
        <div
          id="bar"
          className={styles.circle}
          style={{ transform: `rotate(-${p}deg)` }}
        ></div>
        <div className={styles.timeBox}>
          Tiempo Promedio
          <span>41:23</span>
        </div>
      </div>
    </div>
  );
};

export default SemiCircleProgress;
