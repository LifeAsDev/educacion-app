// components/SemiCircleProgress.tsx
import React from "react";
import styles from "./styles.module.css";
import {
  formatMinutesBeautiful,
  formatSecondsToMinutes,
} from "@/lib/calculationFunctions";

interface Props {
  progress: number; // Valor del progreso entre 0 y 100
  time: number;
}

const SemiCircleProgress: React.FC<Props> = ({ progress, time }) => {
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
          Acierto Promedio
          <span>{progress}%</span>
          Tiempo Promedio
          <span>{formatSecondsToMinutes(time)}</span>
        </div>
      </div>
    </div>
  );
};

export default SemiCircleProgress;
