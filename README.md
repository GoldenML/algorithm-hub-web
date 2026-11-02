# Algorithm Hub - 算法学习手册

一个纯前端的算法学习站点：每种算法都配有 **可交互的可视化演示**、**完整的 JavaScript 代码实现** 与 **图文详解**。无需登录，打开即学。

技术栈：Vite 8 + React 19 + TypeScript + Ant Design 6 + React Router 7。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 生产构建（tsc 类型检查 + vite 打包）
npm run build

# 本地预览生产构建产物
npm run preview

# ESLint 代码检查（--fix 自动修复可修复问题）
npm run lint
```

## 功能一览

| 分类 | 内容 | 演示形式 |
| --- | --- | --- |
| 排序算法 | 冒泡、选择、插入、归并、快速、堆排序 | 柱状图逐步动画（比较/交换/写回/就位分色），可播放暂停、单步、调速、随机打乱 |
| 深度/广度搜索 | BFS（队列）、DFS（栈） | 可编辑网格迷宫：点击加墙、随机迷宫，展示访问顺序与最短路径差异 |
| 贪心算法 | 区间调度（活动选择）、找零钱、分发饼干、跳跃游戏、无重叠区间 | 时间轴动画；找零钱含 `[1,5,11]` 经典反例，与 DP 最优解实时对比 |
| 动态规划 | 爬楼梯、0-1 背包 | dp 数组 / 二维 dp 表格逐格填写动画，高亮当前格与依赖格 |
| 二分查找 | 标准二分、左边界、右边界、二分答案 | lo / mid / hi 指针实时动画 |

每个算法页面均包含：

- **可视化演示**：基于生成器（Generator）逐步产出动画帧，由通用播放器驱动；
- **代码实现**：带语法高亮与一键复制的代码块；
- **算法详解**：核心思想、分步拆解、适用场景与常见陷阱；
- **复杂度分析**：最好/平均/最坏时间、空间复杂度与稳定性标签。

## 项目结构

```
algorithm-hub/
├── eslint.config.js        # ESLint 平面配置
├── index.html
├── src/
│   ├── algorithms/         # 算法数据层：生成器 + 代码 + 详解文本
│   │   ├── types.ts        # 动画帧 / 元数据类型定义
│   │   ├── sorting.ts      # 六大排序
│   │   ├── search.ts       # BFS / DFS
│   │   ├── greedy.ts       # 区间调度 / 找零钱
│   │   ├── dp.ts           # 爬楼梯 / 0-1 背包
│   │   └── binary.ts       # 二分查找
│   ├── components/
│   │   ├── AlgoExplain.tsx # 算法详解区（思想+详解+复杂度+代码）
│   │   └── CodeBlock.tsx   # 轻量语法高亮代码块
│   ├── hooks/
│   │   └── usePlayer.ts    # 通用步骤播放器（播放/单步/调速）
│   ├── layouts/
│   │   └── MainLayout.tsx  # 侧边栏 + 顶栏布局
│   ├── pages/              # Home / Sorting / GraphSearch / Greedy / DynamicProgramming / BinarySearch / NotFound
│   └── router/index.tsx    # 路由表
└── vite.config.ts          # @、@components、@algorithms 等路径别名
```

## 如何新增一个算法

1. 在 `src/algorithms/` 对应文件中实现一个**生成器函数**，逐步 `yield` 动画帧（参考 `sorting.ts` 中的写法）；
2. 补充该算法的元数据（名称、核心思想、详解段落、复杂度、代码字符串）；
3. 在对应页面把它加入展示列表即可，播放器与详解区完全复用。
