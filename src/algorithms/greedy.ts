import type { IntervalStep, CoinStep } from "./types";

export interface Interval {
  start: number;
  end: number;
  label: string;
}

/** 活动选择：按结束时间贪心，返回步骤流 */
export function* intervalScheduling(
  intervals: Interval[],
): Generator<IntervalStep, void, unknown> {
  const sorted = [...intervals].sort((x, y) => x.end - y.end);
  const chosen: number[] = [];
  let lastEnd = -Infinity;

  yield {
    chosen: [],
    current: -1,
    note: "第一步：把所有活动按结束时间从早到晚排序",
  };

  for (let i = 0; i < sorted.length; i++) {
    const it = sorted[i];
    const ok = it.start >= lastEnd;
    if (ok) {
      chosen.push(i);
      lastEnd = it.end;
    }
    yield {
      chosen: [...chosen],
      current: i,
      rejected: !ok,
      note: ok
        ? "活动的开始时间 ≥ 上一个选中活动的结束时间，不冲突，选它！"
        : "活动与已选活动时间冲突，丢弃",
    };
  }
  yield {
    chosen: [...chosen],
    current: -1,
    note: "结束：最多能参加 " + chosen.length + " 个互不冲突的活动",
  };
}

/** 找零钱贪心：每次都拿最大面额 */
export function* coinChangeGreedy(
  amount: number,
  coins: number[],
): Generator<CoinStep, void, unknown> {
  const sorted = [...coins].sort((a, b) => b - a);
  let remaining = amount;
  const picked: number[] = [];

  yield {
    remaining,
    picked: [],
    note: "目标金额 " + amount + "，从最大面额开始尝试",
  };

  for (const c of sorted) {
    while (remaining >= c) {
      picked.push(c);
      remaining -= c;
      yield {
        remaining,
        picked: [...picked],
        current: c,
        note: "拿一枚 " + c + "，剩余 " + remaining,
      };
    }
  }
  yield {
    remaining,
    picked: [...picked],
    note: "结束：共 " + picked.length + " 枚硬币",
  };
}

export const INTERVAL_EXAMPLE: Interval[] = [
  { start: 1, end: 4, label: "A" },
  { start: 3, end: 5, label: "B" },
  { start: 0, end: 6, label: "C" },
  { start: 5, end: 7, label: "D" },
  { start: 3, end: 9, label: "E" },
  { start: 5, end: 9, label: "F" },
  { start: 6, end: 10, label: "G" },
  { start: 8, end: 11, label: "H" },
  { start: 8, end: 12, label: "I" },
  { start: 2, end: 14, label: "J" },
  { start: 12, end: 16, label: "K" },
];

export function randomIntervals(): Interval[] {
  const n = 8 + Math.floor(Math.random() * 4);
  const list: Interval[] = [];
  const letters = "ABCDEFGHIJKLMN";
  for (let i = 0; i < n; i++) {
    const start = Math.floor(Math.random() * 16);
    const end = start + 2 + Math.floor(Math.random() * 5);
    list.push({ start, end, label: letters[i] });
  }
  return list;
}
