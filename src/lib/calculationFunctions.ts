function calculateRemainingTime(startTime: string | undefined): number | null {
  if (!startTime) return null;
  const startTimeMs = new Date(startTime).getTime(); // Convertir startTime a milisegundos
  const nowMs = Date.now(); // Obtener el tiempo actual en milisegundos

  const differenceMs = nowMs - startTimeMs; // Calcular la diferencia en milisegundos
  const ninetyMinutesMs = 90 * 60 * 1000; // 90 minutos en milisegundos

  let remainingTimeMs = ninetyMinutesMs - differenceMs; // Restar la diferencia a 90 minutos

  // Obtener la hora actual y ajustarla a la medianoche para comprobar si cruzamos el límite
  const currentTime = new Date();
  currentTime.setHours(0, 0, 0, 0); // Establecer la hora actual a las 00:00
  const midnightMs = currentTime.getTime();

  // Si el tiempo restante es menor que cero, ajustarlo a la medianoche
  if (remainingTimeMs < midnightMs) {
    remainingTimeMs = 0;
  }

  return remainingTimeMs;
}

export { calculateRemainingTime };
