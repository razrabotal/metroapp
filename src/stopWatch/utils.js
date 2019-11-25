// utility functions used in the project
// prepend a zero to integers smaller than 10 (used for the second and minute values)
function zeroPadded(number) {
  return number >= 10 ? number.toString() : `0${number}`;
}
// consider the last digit of the input number (used for the tenths of seconds)
function lastDigit(number) {
  return number.toString().slice(-2);
}

/* format time in the following format
mm:ss:t
zero padded minutes, zero padded seconds, tenths of seconds
*/
export function formatTime(milliseconds) {
  const mm = zeroPadded(Math.floor(milliseconds / 1000 / 60));
  const ss = zeroPadded(Math.floor(milliseconds / 1000) % 60);
  const t = lastDigit(Math.floor(milliseconds / 10));
  return `${mm}:${ss}.${t}`;
}