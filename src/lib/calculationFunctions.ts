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
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}
export { calculateRemainingTime, formatSecondsToMinutes };
