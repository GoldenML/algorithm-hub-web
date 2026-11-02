import type { SearchAlgoMeta, GridStep } from "./types";

/**
 * 网格 BFS
 * grid[i][j] === 1 表示墙
 */
export function* bfsSearch(
  grid: number[][],
  start: number,
  end: number,
  cols: number,
): Generator<GridStep, void, unknown> {
  const rows = grid.length;
  const visited = new Array(rows * cols).fill(false);
  const parent = new Array(rows * cols).fill(-1);
  const queue: number[] = [start];
  visited[start] = true;
  yield { frontier: [...queue], note: "起点入队，BFS 使用先进先出的队列" };

  while (queue.length > 0) {
    const cur = queue.shift()!;
    yield {
      visit: cur,
      frontier: [...queue],
      note:
        cur === end
          ? "出队的是终点，搜索结束！"
          : "出队一个格子，按 上→右→下→左 的顺序把未访问的邻居入队",
    };
    if (cur === end) break;
    const r = Math.floor(cur / cols);
    const c = cur % cols;
    const neighbors = [
      [r - 1, c],
      [r, c + 1],
      [r + 1, c],
      [r, c - 1],
    ];
    for (const [nr, nc] of neighbors) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const idx = nr * cols + nc;
      if (grid[nr][nc] === 1 || visited[idx]) continue;
      visited[idx] = true;
      parent[idx] = cur;
      queue.push(idx);
    }
  }

  if (parent[end] === -1 && end !== start) {
    yield { note: "搜索完毕：终点不可达 😢 试着移开一些墙再试" };
    return;
  }
  const path: number[] = [];
  for (let cur = end; cur !== -1; cur = parent[cur]) path.unshift(cur);
  yield { path, note: "回溯 parent 指针得到最短路径（绿色）" };
}

/** 网格 DFS（迭代栈版，与 BFS 代码结构完全对称） */
export function* dfsSearch(
  grid: number[][],
  start: number,
  end: number,
  cols: number,
): Generator<GridStep, void, unknown> {
  const rows = grid.length;
  const visited = new Array(rows * cols).fill(false);
  const parent = new Array(rows * cols).fill(-1);
  const stack: number[] = [start];
  yield { frontier: [...stack], note: "起点入栈，DFS 使用后进先出的栈" };

  while (stack.length > 0) {
    const cur = stack.pop()!;
    if (visited[cur]) continue;
    visited[cur] = true;
    yield {
      visit: cur,
      frontier: [...stack],
      note:
        cur === end
          ? "弹出的是终点，搜索结束！"
          : "弹出栈顶格子，把未访问的邻居压栈——一路走到底再回头",
    };
    if (cur === end) break;
    const r = Math.floor(cur / cols);
    const c = cur % cols;
    const neighbors = [
      [r, c - 1],
      [r + 1, c],
      [r, c + 1],
      [r - 1, c],
    ];
    for (const [nr, nc] of neighbors) {
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const idx = nr * cols + nc;
      if (grid[nr][nc] === 1 || visited[idx]) continue;
      parent[idx] = cur;
      stack.push(idx);
    }
  }

  if (parent[end] === -1 && end !== start) {
    yield { note: "搜索完毕：终点不可达 😢 试着移开一些墙再试" };
    return;
  }
  const path: number[] = [];
  for (let cur = end; cur !== -1; cur = parent[cur]) path.unshift(cur);
  yield { path, note: "回溯 parent 指针得到一条路径（绿色，注意通常不是最短路）" };
}

export const SEARCH_ALGOS: SearchAlgoMeta[] = [
  {
    key: "bfs",
    name: "广度优先搜索",
    nameEn: "BFS, Breadth-First Search",
    tagline: "像水波扩散，一圈一圈向外，天然求最短路",
    idea: "从起点出发，借助『队列』按距离由近到远逐层访问所有节点，第一次到达终点时走的层数就是最短步数。",
    description: [
      "BFS 借助队列（先进先出）实现：起点入队后，每次取出队首节点，把它的所有未访问邻居依次入队。这保证了访问顺序是按『与起点的距离』分层的——先访问完所有距离为 1 的点，再访问距离为 2 的点，像水面的涟漪一圈圈扩散。",
      "这个分层性质带来了 BFS 最重要的结论：在边权相等的图中，BFS 第一次到达某节点时，经过的层数就是起点到它的最短距离。因此无权图的最短路问题（迷宫最短路径、社交关系二度人脉、棋盘最少步数）都用 BFS。",
      "复杂度 O(V + E)：每个点入队一次、每条边看一次。空间上队列最坏要存一整层的节点。注意『入队时』就要标记 visited，否则同一节点会被重复入队导致指数爆炸。",
    ],
    complexity: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)", space: "O(V)", stable: true },
    code: `
function bfs(grid, start, end) {
  const ROWS = grid.length, COLS = grid[0].length;
  const visited = new Set([start]);
  const parent = { [start]: -1 };       // 记录来路，用于回溯路径
  const queue = [start];                // 队列：先进先出

  while (queue.length > 0) {
    const cur = queue.shift();          // 取出队首
    if (cur === end) break;

    const r = Math.floor(cur / COLS);
    const c = cur % COLS;
    for (const [nr, nc] of [[r-1,c],[r,c+1],[r+1,c],[r,c-1]]) {
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const idx = nr * COLS + nc;
      if (grid[nr][nc] === 1 || visited.has(idx)) continue; // 墙或已访问
      visited.add(idx);                 // 入队时立刻标记！
      parent[idx] = cur;
      queue.push(idx);
    }
  }

  // 回溯最短路径
  const path = [];
  for (let cur = end; cur !== -1; cur = parent[cur]) path.unshift(cur);
  return path;
}
`,
    run: bfsSearch,
  },
  {
    key: "dfs",
    name: "深度优先搜索",
    nameEn: "DFS, Depth-First Search",
    tagline: "一条路走到黑，走不通再回头",
    idea: "从起点出发沿一条路径不断深入，走不通就回溯到上一个岔路口换一条路，借助『栈』或递归实现。",
    description: [
      "DFS 可以用递归天然地表达：访问一个节点时，先标记它，再对每个未访问的邻居递归下去。递归调用本身就是一张『栈』；迭代写法则用显式栈，每次弹出栈顶访问。两种写法等价，迭代版要注意『出栈时再判 visited』（因为同一节点可能被多次压栈）。",
      "DFS 不保证最短路——它会先一条路走到底，找到的路径取决于邻居的遍历顺序。但它是解决『存在性』与『结构类』问题的利器：连通块个数、岛屿数量、括号/排列组合的回溯、拓扑排序、检测环，全部基于 DFS。",
      "复杂度同样 O(V + E)。递归实现注意栈深度：网格题 1000×1000 最坏递归 10⁶ 层会爆栈，需要改写成显式栈的迭代版。",
    ],
    complexity: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)", space: "O(V)", stable: true },
    code: `
// ---- 递归写法（最常用）----
function dfs(grid, r, c, visited) {
  const ROWS = grid.length, COLS = grid[0].length;
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;   // 越界
  if (grid[r][c] === 1) return;                            // 撞墙
  if (visited[r][c]) return;                               // 已访问
  visited[r][c] = true;                                    // 标记
  dfs(grid, r - 1, c, visited);                            // 上
  dfs(grid, r, c + 1, visited);                            // 右
  dfs(grid, r + 1, c, visited);                            // 下
  dfs(grid, r, c - 1, visited);                            // 左
}

// ---- 迭代写法（显式栈，防爆栈）----
function dfsIter(grid, start, end) {
  const COLS = grid[0].length;
  const visited = new Set();
  const parent = { [start]: -1 };
  const stack = [start];                  // 栈：后进先出

  while (stack.length > 0) {
    const cur = stack.pop();              // 弹出栈顶
    if (visited.has(cur)) continue;       // 同一节点可能多次压栈
    visited.add(cur);
    if (cur === end) break;

    const r = Math.floor(cur / COLS);
    const c = cur % COLS;
    for (const [nr, nc] of [[r,c-1],[r+1,c],[r,c+1],[r-1,c]]) {
      const idx = nr * COLS + nc;
      if (grid[nr]?.[nc] !== 0 || visited.has(idx)) continue;
      parent[idx] = cur;
      stack.push(idx);
    }
  }
  return parent;
}
`,
    run: dfsSearch,
  },
];
