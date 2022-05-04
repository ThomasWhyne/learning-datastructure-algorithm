export function randomInt(start: number, end: number): number {
  start = Math.min(start, end);
  end = Math.max(start, end);
  return Math.floor((end - start) * Math.random()) + start;
}
