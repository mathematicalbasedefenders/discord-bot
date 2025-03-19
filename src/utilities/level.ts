function getLevel(experiencePoints: number | undefined) {
  if (typeof experiencePoints !== "number") {
    return {
      level: 0,
      progressToNext: 0
    };
  }
  let level = 0;
  let stock = experiencePoints;
  while (stock > 100 * 1.1 ** level) {
    stock -= 100 * 1.1 ** level;
    level++;
  }
  return {
    level: level,
    progressToNext: stock / (100 * 1.1 ** level + 1)
  };
}
