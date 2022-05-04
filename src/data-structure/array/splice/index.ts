export function shift(
  list: any[],
  startIndex: number,
  endIndex: number,
  distance: number
): typeof list {
  if (distance < 0) {
    let i = startIndex;
    while (i <= endIndex) {
      list[i + distance] = list[i];
      i++;
    }
  } else {
    let i = endIndex;
    while (i >= startIndex) {
      list[i + distance] = list[i];
      i--;
    }
  }

  return list;
}
export function replace(
  list: any[],
  startIndex: number,
  items: typeof list
): typeof list {
  let i = 0;
  while (i < items.length) {
    list[startIndex + i] = items[i];
    i++;
  }
  return list;
}

export function remove(
  list: any[],
  startIndex: number,
  endIndex: number
): typeof list {
  const count = endIndex - startIndex + 1;
  const shiftStart = endIndex + 1;
  const shiftEnd = list.length - 1;
  shift(list, shiftStart, shiftEnd, -count);
  list.length = list.length - count;
  return list;
}

export function insert(
  list: any[],
  startIndex: number,
  items: typeof list
): typeof list {
  const oriLastIndex = list.length - 1;
  list.length = list.length + items.length;
  shift(list, startIndex, oriLastIndex, items.length);
  replace(list, startIndex, items);
  return list;
}

export function splice<T = any>(
  this: T[],
  startIndex: number,
  deleteCount: number,
  ...items: typeof this
): typeof this {
  const normedDelCount = Math.min(
    deleteCount,
    this.length - startIndex,
    this.length
  );

  if (normedDelCount === items.length) {
    replace(this, startIndex, items);
  } else if (normedDelCount < items.length) {
    if (normedDelCount) remove(this, startIndex, startIndex + deleteCount - 1);
    insert(this, startIndex, items);
  } else {
    if (items.length) replace(this, startIndex, items);
    remove(this, startIndex + items.length, startIndex + deleteCount - 1);
  }

  return this;
}
