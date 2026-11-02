import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Slider,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  CaretRightOutlined,
  PauseOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  RedoOutlined,
  FastForwardOutlined,
} from "@ant-design/icons";
import { climbStairs, knapsack01, KNAPSACK_ITEMS } from "@algorithms/dp";
import type { DPStep } from "@algorithms/types";
import { collect, usePlayer } from "@hooks/usePlayer";
import AlgoExplain from "@components/AlgoExplain";
import CodeBlock from "@components/CodeBlock";

const { Title, Paragraph, Text } = Typography;

const STAIRS_CODE = `
function climbStairs(n) {
  // dp[i] 表示爬到第 i 阶的方法数
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;                       // 边界：站在地面 1 种方式
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]; // 状态转移方程
  }
  return dp[n];
}

// 空间优化：只依赖前两项，滚动变量即可
function climbStairsO1(n) {
  let prev = 1, cur = 1;
  for (let i = 2; i <= n; i++) {
    [prev, cur] = [cur, prev + cur];
  }
  return cur;
}
`;

const KNAPSACK_CODE = `
function knapsack01(weights, values, capacity) {
  const n = weights.length;
  // dp[i][w]：只考虑前 i 件物品、容量 w 时的最大价值
  const dp = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const wt = weights[i - 1], val = values[i - 1];
    for (let w = 0; w <= capacity; w++) {
      if (wt > w) {
        dp[i][w] = dp[i - 1][w];                    // 放不下，只能不选
      } else {
        dp[i][w] = Math.max(                        // 选 / 不选，取较大
          dp[i - 1][w],                             // 不选第 i 件
          dp[i - 1][w - wt] + val                   // 选第 i 件
        );
      }
    }
  }
  return dp[n][capacity];
}

// 空间优化：一维滚动数组（注意 w 必须倒序遍历！）
function knapsack01Opt(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    for (let w = capacity; w >= weights[i]; w--) {  // 倒序防止重复选取
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }
  return dp[capacity];
}
`;

/* ---------------- 爬楼梯演示 ---------------- */
function StairsDemo() {
  const [n, setN] = useState(10);
  const steps: DPStep[] = useMemo(() => collect(climbStairs(n)), [n]);
  const player = usePlayer(steps.length, 500);
  const step = steps[Math.min(player.idx, steps.length - 1)];

  const filledSet = new Set(step.filled.map(([, c]) => c));
  const depSet = new Set((step.deps ?? []).map(([, c]) => c));
  const current = step.current ? step.current[1] : -1;
  const dp = step.values[0];
  const maxV = Math.max(...dp, 1);

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap style={{ justifyContent: "space-between", width: "100%" }}>
          <Space wrap>
            <Button
              type="primary"
              icon={player.playing ? <PauseOutlined /> : <CaretRightOutlined />}
              onClick={() => {
                if (player.atEnd) player.setIdx(0);
                player.setPlaying(!player.playing);
              }}
            >
              {player.playing ? "暂停" : "播放"}
            </Button>
            <Button icon={<StepBackwardOutlined />} onClick={() => player.setIdx((i) => Math.max(0, i - 1))} />
            <Button icon={<StepForwardOutlined />} onClick={() => player.setIdx((i) => Math.min(steps.length - 1, i + 1))} />
            <Button icon={<RedoOutlined />} onClick={player.reset}>重置</Button>
            <Button icon={<FastForwardOutlined />} onClick={player.toEnd}>直接看结果</Button>
          </Space>
          <Space>
            <Text>阶数 n</Text>
            <Slider min={2} max={15} value={n} onChange={setN} style={{ width: 160 }} />
            <Tag color="purple">答案：dp[{n}] = {dp[n]}</Tag>
          </Space>
        </Space>
      </Card>

      <div className="viz-bars">
        {dp.map((v, i) => {
          const cls = i === current
            ? "viz-bar is-current"
            : depSet.has(i)
              ? "viz-bar is-mid"
              : filledSet.has(i)
                ? "viz-bar is-filled"
                : "viz-bar is-out";
          return (
            <div key={i} className={cls} style={{ height: `${(v / maxV) * 100}%` }} title={`dp[${i}] = ${v}`}>
              <span className="bar-value">{v}</span>
              <span className="bar-tag">dp[{i}]</span>
            </div>
          );
        })}
      </div>

      <div className="step-note">
        <b>
          [{player.idx + 1}/{steps.length}]
        </b>{" "}
        {step.note}（绿色 = 已填好，黄色 = 当前依赖的子问题，橙色 = 正在计算）
      </div>
    </div>
  );
}

/* ---------------- 0-1 背包演示 ---------------- */
function KnapsackDemo() {
  const [capacity, setCapacity] = useState(8);
  const items = KNAPSACK_ITEMS;
  const steps: DPStep[] = useMemo(
    () => collect(knapsack01(items, capacity)),
    [items, capacity],
  );
  const player = usePlayer(steps.length, 220);
  const step = steps[Math.min(player.idx, steps.length - 1)];

  const filledSet = new Set(step.filled.map(([r, c]) => r + ":" + c));
  const depSet = new Set((step.deps ?? []).map(([r, c]) => r + ":" + c));
  const cur = step.current ? step.current[0] + ":" + step.current[1] : "";

  return (
    <div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap style={{ justifyContent: "space-between", width: "100%" }}>
          <Space wrap>
            <Button
              type="primary"
              icon={player.playing ? <PauseOutlined /> : <CaretRightOutlined />}
              onClick={() => {
                if (player.atEnd) player.setIdx(0);
                player.setPlaying(!player.playing);
              }}
            >
              {player.playing ? "暂停" : "播放"}
            </Button>
            <Button icon={<StepForwardOutlined />} onClick={() => player.setIdx((i) => Math.min(steps.length - 1, i + 1))} />
            <Button icon={<RedoOutlined />} onClick={player.reset}>重置</Button>
            <span style={{ color: "#999" }}>
              第 {player.idx + 1} / {steps.length} 步
            </span>
          </Space>
          <Space>
            <Text>背包容量</Text>
            <Slider min={4} max={10} value={capacity} onChange={setCapacity} style={{ width: 140 }} />
            {items.map((it) => (
              <Tag key={it.name}>
                {it.name} 重{it.weight} 值{it.value}
              </Tag>
            ))}
          </Space>
        </Space>
      </Card>

      <div className="dp-table">
        <div className="dp-row">
          <div className="dp-cell is-head">i \ w</div>
          {Array.from({ length: capacity + 1 }, (_, w) => (
            <div className="dp-cell is-head" key={w}>
              {w}
            </div>
          ))}
        </div>
        {step.values.map((row, i) => (
          <div className="dp-row" key={i}>
            <div className="dp-cell is-head">
              {i === 0 ? "∅" : items[i - 1].name}
            </div>
            {row.map((v, w) => {
              const key = i + ":" + w;
              const cls = key === cur
                ? "dp-cell is-current"
                : depSet.has(key)
                  ? "dp-cell is-dep"
                  : filledSet.has(key)
                    ? "dp-cell is-filled"
                    : "dp-cell";
              return (
                <div className={cls} key={w} title={`dp[${i}][${w}] = ${v}`}>
                  {v}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="step-note" style={{ marginTop: 12 }}>
        <b>
          [{player.idx + 1}/{steps.length}]
        </b>{" "}
        {step.note}
      </div>
    </div>
  );
}

export default function DynamicProgramming() {
  return (
    <div>
      <Title level={3}>动态规划</Title>
      <Alert
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        message="动态规划：把原问题拆成重叠子问题，每个子问题只求解一次并记录结果（记忆化），再用状态转移方程自底向上推出答案。适用三要素：最优子结构、重叠子问题、无后效性。"
      />

      <Tabs
        size="large"
        items={[
          {
            key: "stairs",
            label: "爬楼梯",
            children: (
              <div>
                <StairsDemo />
                <AlgoExplain
                  idea="到第 i 阶的最后一步要么从 i-1 跨 1 步、要么从 i-2 跨 2 步，所以方法数是两者之和。"
                  description={[
                    "爬楼梯是理解动态规划最好的第一课：f(i) 表示爬到第 i 阶的方法数。由于每步只能跨 1 或 2 阶，到达第 i 阶的最后一步只有两种可能——从第 i-1 阶跨一步，或从第 i-2 阶跨两步。这两种情况互斥且完备，所以 f(i) = f(i-1) + f(i-2)。这正是斐波那契数列。",
                    "为什么暴力递归慢？画出递归树就会发现 f(i-1) 和 f(i-2) 的计算过程中包含大量重复的子问题（重叠子问题），复杂度是指数级 O(2^n)。动态规划用一个数组把每个 f(i) 只算一次并保存下来，复杂度骤降到 O(n)——这就是『记忆化』的力量。",
                    "再进一步：f(i) 只依赖 f(i-1) 和 f(i-2) 两项，之前的结果以后都用不到了，因此可以只用两个滚动变量，空间从 O(n) 优化到 O(1)。这种『滚动数组优化』是 DP 优化的常见套路。",
                  ]}
                  complexity={{
                    best: "O(n)",
                    average: "O(n)",
                    worst: "O(n)",
                    space: "O(n) → O(1)",
                    stable: true,
                  }}
                  code={STAIRS_CODE}
                  codeTitle="爬楼梯 · JavaScript 实现"
                />
              </div>
            ),
          },
          {
            key: "knapsack",
            label: "0-1 背包",
            children: (
              <div>
                <KnapsackDemo />
                <Card size="small" style={{ marginTop: 8 }}>
                  <Paragraph>
                    <b>问题：</b>n 件物品，第 i 件重量 wᵢ、价值 vᵢ，每件只能选一次，
                    背包容量有限，求能装下的最大价值。
                  </Paragraph>
                  <Paragraph>
                    <b>状态设计：</b>dp[i][w] 表示「只考虑前 i 件物品、背包容量为 w」时的最大价值。
                    对第 i 件物品只有两种决策：
                    <Text code>不选</Text>
                    则 dp[i][w] = dp[i-1][w]；
                    <Text code>选</Text>
                    则腾出 wᵢ 的空间装它，dp[i][w] = dp[i-1][w-wᵢ] + vᵢ。
                    两者取较大值，这就是状态转移方程。表格按行填满后，右下角 dp[n][W] 即答案。
                  </Paragraph>
                  <Paragraph>
                    <b>一个细节：</b>一维优化时容量 w 必须<b>倒序</b>遍历。
                    正序会让 dp[w-wᵢ] 已经是「本轮更新过」的值，等价于第 i 件被选了多次（变成完全背包）；
                    倒序保证用到的仍是上一行的旧值。表格动画里可以清楚看到每个格子只依赖上一行的两个格子。
                  </Paragraph>
                  <Paragraph>
                    <b>复杂度：</b>时间 O(n·W)，空间 O(n·W)，一维优化后 O(W)。
                  </Paragraph>
                </Card>
                <CodeBlock code={KNAPSACK_CODE} title="0-1 背包 · JavaScript 实现" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
