import * as number from './index';

describe('-- number', () => {
  const units = Array.from({ length: 100 }, () => [
    Math.floor(1000 * Math.random()),
    Math.floor(1000 * Math.random()),
  ]);
  it(`--- [number:randomInt] should generate int between given start and end range in ${units.length} cases`, () => {
    units.forEach(([start, end]) => {
      const result = number.randomInt(start, end);
      expect(result).toBeGreaterThanOrEqual(Math.min(start, end));
      expect(result).toBeLessThanOrEqual(Math.max(start, end));
    });
  });
});
