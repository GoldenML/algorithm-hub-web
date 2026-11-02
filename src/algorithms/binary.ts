/** 二分查找动画的一帧 */
export interface BinaryStep {
  lo: number;
  hi: number;
  mid: number;
  note: string;
  found?: boolean;
  notFound?: boolean;
}

export function* binarySearch(
  arr: number[],
  target: number,
): Generator<BinaryStep, void, unknown> {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    yield {
      lo,
      hi,
      mid,
      note:
        "mid = (" + lo + " + " + hi + ") / 2 = " + mid +
        "，a[mid] = " + arr[mid] +
        (arr[mid] === target
          ? "，等于目标 " + target + "，找到！"
          : arr[mid] < target
            ? "，小于目标 " + target + "，目标在右半区，lo = mid + 1"
            : "，大于目标 " + target + "，目标在左半区，hi = mid - 1"),
    };
    if (arr[mid] === target) {
      yield { lo, hi, mid, found: true, note: "命中下标 " + mid + " 🎉" };
      return;
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  yield {
    lo,
    hi,
    mid: -1,
    notFound: true,
    note: "lo > hi，区间为空，数组中不存在 " + target,
  };
}
