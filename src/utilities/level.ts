const BASE = 100;
const MULTIPLIER = 1.1;

function getLevel(experiencePoints: number | undefined) {
  if (typeof experiencePoints !== "number") {
    return {
      level: 0,
      progressToNext: 0
    };
  }
  let level = 0;
  let stock = experiencePoints;
  while (stock > BASE * MULTIPLIER ** level) {
    stock -= BASE * MULTIPLIER ** level;
    level++;
  }
  return {
    level: level,
    progressToNext: stock / (BASE * MULTIPLIER ** level + 1)
  };
}
