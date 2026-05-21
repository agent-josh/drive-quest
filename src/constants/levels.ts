/** Level = floor(totalPoints / 100) + 1 — mirrors DB function calculate_level */
export function calculateLevel(totalPoints: number): number {
  return Math.max(1, Math.floor(totalPoints / 100) + 1);
}

export function pointsToNextLevel(totalPoints: number): number {
  const currentLevel = calculateLevel(totalPoints);
  const nextLevelThreshold = (currentLevel) * 100;
  return Math.max(0, nextLevelThreshold - totalPoints);
}

export function levelProgress(totalPoints: number): number {
  const levelStart = (calculateLevel(totalPoints) - 1) * 100;
  const progress = totalPoints - levelStart;
  return Math.min(1, progress / 100);
}
