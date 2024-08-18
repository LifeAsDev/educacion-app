function calculateRemainingTime(
  startTime: string,
  remainingTime: number = 90
): number {
  const startTimeMs = new Date(startTime).getTime(); // Convertir startTime a milisegundos
  const nowMs = Date.now(); // Obtener el tiempo actual en milisegundos

  const differenceMs = nowMs - startTimeMs; // Calcular la diferencia en milisegundos
  const ninetyMinutesMs = remainingTime * 60 * 1000; // Tiempo restante en milisegundos

  const remainingTimeMs = ninetyMinutesMs - differenceMs; // Restar la diferencia al tiempo total

  // Si el tiempo restante es menor que cero, ajustar a cero
  if (remainingTimeMs < 0) {
    return 0;
  }

  return Math.floor(remainingTimeMs / 1000); // Convertir milisegundos a segundos y devolver
}

function formatSecondsToMinutes(seconds: number): string {
  const minutes = seconds / 60;
  return formatMinutesBeautiful(minutes);
}

function formatMinutesBeautiful(minutes: number): string {
  const seconds = Math.floor(minutes * 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = Math.floor(minutes).toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

function getFinishTime(
  startTime: string = Date.now().toString(),
  endTime: string = Date.now().toString(),
  remainingTime: number = 90
): number {
  const startTimeMs = new Date(startTime).getTime(); // Convertir startTime a milisegundos
  const endTimeMs = new Date(endTime).getTime(); // Convertir endTime a milisegundos

  const differenceMs = endTimeMs - startTimeMs; // Calcular la diferencia en milisegundos
  const remainingTimeMs = remainingTime * 60 * 1000; // Tiempo restante en milisegundos

  // Si la diferencia de tiempo es negativa, ajustarla a cero
  if (differenceMs < 0) {
    return 0;
  }

  // Asegurar que la diferencia no exceda el tiempo restante
  const limitedDifferenceMs = Math.max(
    Math.min(remainingTimeMs - differenceMs, remainingTimeMs),
    0
  );

  return Math.floor(limitedDifferenceMs / 1000); // Convertir milisegundos a segundos y devolver
}

function calcularNotaEspecifica(
  aciertoPercentage: number,
  e: number = 0.6
): number {
  const nMax = 7.0;
  const nMin = 1.0;
  const nApr = 4.0;
  const pMax = 100.0;

  if (aciertoPercentage < e * pMax) {
    return (nApr - nMin) * (aciertoPercentage / (e * pMax)) + nMin;
  } else {
    return (
      (nMax - nApr) * ((aciertoPercentage - e * pMax) / (pMax * (1 - e))) + nApr
    );
  }
}

export {
  calculateRemainingTime,
  formatSecondsToMinutes,
  getFinishTime,
  formatMinutesBeautiful,
  calcularNotaEspecifica,
};
