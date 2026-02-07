export function getRemainingCalories(consumed: number, target: number): number {
  return Math.max(0, target - consumed);
}

export function getCaloriePercentage(consumed: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min((consumed / target) * 100, 100);
}

export function isOverTarget(consumed: number, target: number): boolean {
  return consumed > target;
}

export function getWeeklyAverage(totalCalories: number, days: number): number {
  if (days <= 0) return 0;
  return Math.round(totalCalories / days);
}
