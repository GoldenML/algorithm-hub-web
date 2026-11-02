/** 排序动画的一帧 */
export interface SortStep {
  /** 当前数组快照 */
  array: number[];
  /** 正在比较的两个下标 */
  compare?: [number, number];
  /** 刚完成交换的两个下标 */
  swap?: [number, number];
  /** 正在被覆写的下标（归并排序写回） */
  overwrite?: number;
  /** 已确定最终位置的下标集合 */
  sorted: number[];
  note?: string;
}

export type SortGenerator = Generator<SortStep, void, unknown>;

export interface Complexity {
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: boolean;
}

export interface SortAlgoMeta {
  key: string;
  name: string;
  nameEn: string;
  tagline: string;
  idea: string;
  description: string[];
  complexity: Complexity;
  code: string;
  run: (input: number[]) => SortGenerator;
}

/** 网格搜索动画的一帧 */
export interface GridStep {
  /** 刚被访问的格子（一维下标） */
  visit?: number;
  /** 当前队列/栈中的候选格子 */
  frontier?: number[];
  /** 最终找到的路径 */
  path?: number[];
  note?: string;
}

export interface SearchAlgoMeta {
  key: "bfs" | "dfs";
  name: string;
  nameEn: string;
  tagline: string;
  idea: string;
  description: string[];
  complexity: Complexity;
  code: string;
  run: (
    grid: number[][],
    start: number,
    end: number,
    cols: number,
  ) => Generator<GridStep, void, unknown>;
}

/** 贪心：活动选择的一帧 */
export interface IntervalStep {
  chosen: number[];
  current: number;
  rejected?: boolean;
  note?: string;
}

/** 贪心：找零钱的一帧 */
export interface CoinStep {
  remaining: number;
  picked: number[];
  current?: number;
  note?: string;
}

/** 动态规划：通用表格步 */
export interface DPStep {
  /** 已填好的格子 [row, col] */
  filled: [number, number][];
  /** 当前正在计算的格子 */
  current?: [number, number];
  /** 依赖的格子 */
  deps?: [number, number][];
  values: number[][];
  note?: string;
}
