export const getMinutesAndSeconds = (seconds: number) => {
  const minutesWithDecimal = seconds / 60;
  const wholeMinutes = Math.floor(minutesWithDecimal);
  const wholeSeconds = Math.round(60 * (minutesWithDecimal % 1));
  return { wholeMinutes, wholeSeconds };
};
