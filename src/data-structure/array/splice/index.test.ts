import * as utils from '../../../utils';

import { shift, replace, remove, insert, splice } from './index';

function intBetween1to100() {
  return utils.number.randomInt(1, 1000);
}

function createArray({
  length = 10,
  getValue = intBetween1to100,
}: { length?: number; getValue?: (index: number) => any } = {}) {
  let i = 0;
  let nextItem;
  const set = new Set();
  while (i < length) {
    nextItem = getValue(i);
    if (!set.has(nextItem)) {
      set.add(nextItem);
      i++;
    }
  }
  return Array.from(set);
}

const configs: { name: string; fn: () => any }[] = [
  {
    name: '--- [array:shift]',
    fn: () => {
      const arr = createArray();
      const lastIndex = arr.length - 1;

      it('should shift first item 1 step forward', () => {
        shift(arr, 0, 0, 1);
        expect(arr[0]).toBe(arr[1]);
      });
      it('should shift first 2 items  2 steps forward', () => {
        const startIndex = 0;
        const endIndex = 1;
        const distance = 2;
        shift(arr, startIndex, endIndex, distance);
        expect(arr.slice(startIndex, endIndex + 1)).toStrictEqual(
          arr.slice(startIndex + distance, endIndex + distance + 1)
        );
      });
      it('should shift last item 1 step backward', () => {
        shift(arr, lastIndex, lastIndex, -1);
        expect(arr[lastIndex]).toBe(arr[lastIndex - 1]);
      });

      it('should shift last 2 items 2 steps backwards', () => {
        const startInex = lastIndex - 2;
        const endIndex = lastIndex - 1;
        const distance = -2;
        shift(arr, startInex, endIndex, distance);
        expect(arr.slice(startInex, endIndex + 1)).toStrictEqual(
          arr.slice(startInex + distance, endIndex + distance + 1)
        );
      });

      it(`should shift a specified array section random steps forward in ${arr.length} cases`, () => {
        const shifTestCases = arr.map(() => {
          const startIndex = utils.number.randomInt(0, lastIndex);
          const endIndex = utils.number.randomInt(0, lastIndex - startIndex);
          const distance = utils.number.randomInt(0, lastIndex - endIndex);
          return {
            startIndex,
            endIndex,
            distance,
          };
        });
        shifTestCases.forEach(({ startIndex, endIndex, distance }) => {
          const expected = arr.slice(startIndex, endIndex + 1);
          shift(arr, startIndex, endIndex, distance);
          expect(
            arr.slice(startIndex + distance, endIndex + distance + 1)
          ).toStrictEqual(expected);
        });
      });
      it(`should shift array item steps backward in ${arr.length} cases`, () => {
        const shifTestCases = arr.map(() => {
          const startIndex = utils.number.randomInt(0, lastIndex);
          const endIndex = utils.number.randomInt(startIndex, lastIndex);
          const distance = utils.number.randomInt(0, startIndex);
          return {
            startIndex,
            endIndex,
            distance: -distance,
          };
        });
        shifTestCases.forEach(({ startIndex, endIndex, distance }) => {
          const expected = arr.slice(startIndex, endIndex + 1);
          shift(arr, startIndex, endIndex, distance);
          expect(
            arr.slice(startIndex + distance, endIndex + distance + 1)
          ).toStrictEqual(expected);
        });
      });
    },
  },
  {
    name: '--- [array:replace]',
    fn: () => {
      const replaceCases = Array.from({ length: 10 }).map(() => {
        const array = createArray({ getValue: () => Symbol() });
        const lastIndex = array.length - 1;
        const startIndex = utils.number.randomInt(0, lastIndex);
        const items = createArray({
          length: utils.number.randomInt(0, lastIndex - startIndex),
        });
        return {
          array,
          startIndex,
          items,
        };
      });
      it(`should replace array items with given item list in ${replaceCases.length} cases`, () => {
        replaceCases.forEach(({ array, startIndex, items }) => {
          replace(array, startIndex, items);
          expect(
            array.slice(startIndex, startIndex + items.length)
          ).toStrictEqual(items);
        });
      });
    },
  },
  {
    name: '--- [array:remove]',
    fn() {
      const removeCases = Array.from({ length: 10 }).map(() => {
        const array = createArray();
        const lastIndex = array.length - 1;
        const startIndex = utils.number.randomInt(0, lastIndex);
        const endIndex = utils.number.randomInt(startIndex, lastIndex);
        return {
          array,
          startIndex,
          endIndex,
        };
      });
      it('should remove all items from array', () => {
        const arr = createArray();
        remove(arr, 0, arr.length - 1);
        expect(arr.length).toBe(0);
      });
      it('should remove 1 item from the start', () => {
        const arr = createArray();
        const cpArr = arr.concat();
        const len = arr.length;
        for (let i = 0; i < len; i++) {
          let toRemoveItem = arr[0];
          remove(arr, 0, 0);
          expect(toRemoveItem).toBe(cpArr.shift());
        }
        expect(arr.length).toBe(cpArr.length);
      });
      it('should remove 3 items from the start', () => {
        const arr = createArray();
        const cpArr = arr.concat();
        const start = 0;
        const end = 2;
        remove(arr, start, end);
        cpArr.splice(start, 3);
        expect(arr).toStrictEqual(cpArr);
      });

      it('should remove 3 item from the mid', () => {
        const arr = createArray();
        const cpArr = arr.concat();
        const start = Math.floor(arr.length / 2);
        const end = start + 2;
        remove(arr, start, end);
        cpArr.splice(start, 3);
        expect(arr).toStrictEqual(cpArr);
      });

      it('should remove 3 item from the end', () => {
        const arr = createArray();
        const cpArr = arr.concat();
        const lastIndex = arr.length - 1;
        const start = lastIndex - 2;
        const end = lastIndex;
        remove(arr, start, end);
        cpArr.splice(start, 3);
        expect(arr).toStrictEqual(cpArr);
      });

      it('should remove random items from array', () => {
        removeCases.forEach(({ array, startIndex, endIndex }) => {
          const cpArr = array.concat();
          cpArr.splice(startIndex, endIndex - startIndex + 1);
          expect(remove(array, startIndex, endIndex)).toStrictEqual(cpArr);
        });
      });
    },
  },
  {
    name: '--- [array:insert]',
    fn() {
      const arr = createArray();
      const inserCases = Array.from({ length: 3 }, (_, idx) => {
        const array = createArray({ length: 3 });
        const items = createArray({ length: 3 });
        return {
          array,
          items,
          startInex: idx,
        };
      });
      it.each(inserCases)(
        'should inster $items to array from index: $startIndex',
        ({ array, items, startInex }) => {
          const cpArr = array.concat();
          cpArr.splice(startInex, 0, ...items);
          insert(array, startInex, items);
          expect(array).toStrictEqual(cpArr);
        }
      );
    },
  },
];

describe('-- array', () => {
  describe('--- splice', () => {
    configs.forEach(({ name, fn }) => {
      describe(name, fn);
    });
    const deletionGreaterOrEqualToInsertionCases = Array.from(
      { length: 4 },
      (_, idx) => {
        const array = createArray();
        const startIndex = utils.number.randomInt(0, array.length - 1);
        const deleteCount = 3;
        const items = createArray({ length: idx });
        return {
          array,
          startIndex,
          deleteCount,
          items,
        };
      }
    );
    const deletionLessOrEqualToInsertionCases = Array.from(
      { length: 4 },
      (_, idx) => {
        const array = createArray();
        const startIndex = utils.number.randomInt(0, array.length - 1);
        const deleteCount = idx;
        const items = createArray({ length: 3 });
        return {
          array,
          startIndex,
          deleteCount,
          items,
        };
      }
    );
    it.each(
      deletionGreaterOrEqualToInsertionCases.concat(
        deletionLessOrEqualToInsertionCases
      )
    )(
      'should splice items from start with $deleteCount deletion and $items.length insertion',
      ({ array, startIndex, deleteCount, items }) => {
        const cp = array.concat();
        splice.apply(array, [startIndex, deleteCount, ...items]);
        cp.splice(startIndex, deleteCount, ...items);
        expect(array).toStrictEqual(cp);
      }
    );
  });
});
