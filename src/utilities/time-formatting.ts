import { log } from "../log";

function millisecondsToTime(milliseconds: number) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    log.warn("Number given is not a positive finite number.");
  }
  let m = Math.floor(milliseconds / 60000);
  let s = Math.floor((milliseconds % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  let ms = Math.floor((milliseconds % 60000) % 1000)
    .toString()
    .padStart(3, "0");
  return `${m}:${s}.${ms}`;
}

export { millisecondsToTime };
