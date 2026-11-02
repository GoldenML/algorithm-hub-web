import type { DPStep } from "./types";

/** 爬楼梯：dp[i] = dp[i-1] + dp[i-2]，一维表格动画 */
export function* climbStairs(n: number): Generator<DPStep, void, unknown> {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  if (n >= 1) dp[1] = 1;
  const filled: [number, number][] = [];
  if (n >= 0) filled.push([0, 0]);
  if (n >= 1) filled.push([0, 1]);
  yield {
    filled: [...filled],
    values: [[...dp]],
    note: "初始状态：到第 0 阶有 1 种方式（不动），到第 1 阶有 1 种方式",
  };
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    filled.push([0, i]);
    yield {
      filled: [...filled],
      current: [0, i],
      deps: [
        [0, i - 1],
        [0, i - 2],
      ],
      values: [[...dp]],
      note:
        "dp[" + i + "] = dp[" + (i - 1) + "] + dp[" + (i - 2) + "] = " +
        dp[i - 1] + " + " + dp[i - 2] + " = " + dp[i],
    };
  }
  yield {
    filled: filled.slice(),
    values: [[...dp]],
    note: "答案：爬到第 " + n + " 阶共有 " + dp[n] + " 种方法",
  };
}

export interface KnapsackItem {
  weight: number;
  value: number;
  name: string;
}

/** 0-1 背包：二维表格逐格填写 */
export function* knapsack01(
  items: KnapsackItem[],
  capacity: number,
): Generator<DPStep, void, unknown> {
  const n = items.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0),
  );
  const filled: [number, number][] = [];
  yield {
    filled: [],
    values: dp.map((r) => [...r]),
    note: "dp[i][w] 表示：只考虑前 i 件物品、背包容量为 w 时的最大价值。第 0 行/列全为 0",
  };

  for (let i = 1; i <= n; i++) {
    const { weight, value, name } = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (weight > w) {
        dp[i][w] = dp[i - 1][w];
        filled.push([i, w]);
        yield {
          filled: filled.slice(),
          current: [i, w],
          deps: [[i - 1, w]],
          values: dp.map((r) => [...r]),
          note: name + " 重 " + weight + " 放不进容量 " + w + " 的背包，继承上一行 " + dp[i][w],
        };
      } else {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight] + value);
        filled.push([i, w]);
        yield {
          filled: filled.slice(),
          current: [i, w],
          deps: [
            [i - 1, w],
            [i - 1, w - weight],
          ],
          values: dp.map((r) => [...r]),
          note:
            "不选 " + name + " = " + dp[i - 1][w] + "；选它 = " +
            dp[i - 1][w - weight] + " + " + value + "，取较大者 " + dp[i][w],
        };
      }
    }
  }
  yield {
    filled: filled.slice(),
    values: dp.map((r) => [...r]),
    current: [n, capacity],
    note: "答案：dp[" + n + "][" + capacity + "] = " + dp[n][capacity],
  };
}

export const KNAPSACK_ITEMS: KnapsackItem[] = [
  { weight: 2, value: 3, name: "物品A" },
  { weight: 3, value: 4, name: "物品B" },
  { weight: 4, value: 5, name: "物品C" },
  { weight: 5, value: 8, name: "物品D" },
];
