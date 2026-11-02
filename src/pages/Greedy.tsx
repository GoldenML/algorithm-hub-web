import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  InputNumber,
  Radio,
  Row,
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
  SyncOutlined,
} from "@ant-design/icons";
import {
  INTERVAL_EXAMPLE,
  randomIntervals,
  intervalScheduling,
  coinChangeGreedy,
} from "@algorithms/greedy";
import type { Interval } from "@algorithms/greedy";
import type { IntervalStep, CoinStep } from "@algorithms/types";
import { collect, usePlayer } from "@hooks/usePlayer";
import CodeBlock from "@components/CodeBlock";

const { Title, Paragraph, Text } = Typography;

/** 用 DP 求最优硬币数，用于与贪心对比 */
function minCoinsDP(amount: number, coins: number[]): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (c <= i && dp[i - c] + 1 < dp[i]) dp[i] = dp[i - c] + 1;
    }
  }
  return dp[amount];
}

/* ---------------- 活动选择演示 ---------------- */
function IntervalDemo() {
  const [intervals, setIntervals] = useState<Interval[]>(INTERVAL_EXAMPLE);
  const sorted = useMemo(
    () => [...intervals].sort((a, b) => a.end - b.end),
    [intervals],
  );
  const steps: IntervalStep[] = useMemo(
    () => collect(intervalScheduling(intervals)),
    [intervals],
  );
  const player = usePlayer(steps.length, 700);
  const step = steps[Math.min(player.idx, steps.length - 1)];

  const chosenSet = new Set(step.chosen);
  const unit = Math.max(...sorted.map((i) => i.end)) + 1;

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
            <span style={{ color: "#999" }}>
              第 {player.idx + 1} / {steps.length} 步
            </span>
          </Space>
          <Button
            icon={<SyncOutlined />}
            onClick={() => {
              setIntervals(randomIntervals());
            }}
          >
            换一组活动
          </Button>
        </Space>
      </Card>

      <div className="timeline">
        {sorted.map((iv, i) => {
          const rejected = step.rejected && step.current === i;
          const currentOk = step.current === i && !rejected;
          const chosen = chosenSet.has(i);
          const cls = chosen
            ? "timeline-bar is-chosen"
            : currentOk
              ? "timeline-bar is-current-ok"
              : rejected
                ? "timeline-bar is-current-bad"
                : "timeline-bar";
          return (
            <div className="timeline-row" key={iv.label + i}>
              <span className="timeline-label">{iv.label}</span>
              <div className="timeline-track">
                <div
                  className={cls}
                  style={{
                    left: `${(iv.start / unit) * 100}%`,
                    width: `${((iv.end - iv.start) / unit) * 100}%`,
                  }}
                  title={`${iv.start} → ${iv.end}`}
                >
                  {iv.start}~{iv.end}
                </div>
              </div>
            </div>
          );
        })}
        <div className="timeline-axis">
          {Array.from({ length: unit + 1 }, (_, t) =>
            t % 2 === 0 ? (
              <span
                key={t}
                className="timeline-tick"
                style={{ left: `${(t / unit) * 100}%` }}
              >
                {t}
              </span>
            ) : null,
          )}
        </div>
      </div>

      <div className="step-note">
        <b>
          [{player.idx + 1}/{steps.length}]
        </b>{" "}
        {step.note}（按结束时间排序后从上到下考虑，绿色 = 已选中）
      </div>
    </div>
  );
}

/* ---------------- 找零钱演示 ---------------- */
function CoinDemo() {
  const [amount, setAmount] = useState(15);
  const [coins, setCoins] = useState<number[]>([1, 5, 11]);

  const steps: CoinStep[] = useMemo(
    () => collect(coinChangeGreedy(amount, coins)),
    [amount, coins],
  );
  const player = usePlayer(steps.length, 500);
  const step = steps[Math.min(player.idx, steps.length - 1)];

  const optimal = minCoinsDP(amount, coins);
  const greedyCount = steps[steps.length - 1]?.picked.length ?? 0;

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
            <Button icon={<StepBackwardOutlined />} onClick={() => player.setIdx((i) => Math.max(0, i - 1))} />
            <Button icon={<RedoOutlined />} onClick={player.reset}>重置</Button>
          </Space>
          <Space wrap>
            <span>目标金额：</span>
            <InputNumber min={1} max={99} value={amount} onChange={(v) => v && setAmount(v)} />
            <span>面额：</span>
            <Radio.Group
              value={coins.join(",")}
              onChange={(e) => {
                setCoins(e.target.value.split(",").map(Number));
              }}
              optionType="button"
              options={[
                { label: "反例面额 [1,5,11]", value: "1,5,11" },
                { label: "人民币 [1,5,10,20,50]", value: "1,5,10,20,50" },
              ]}
            />
          </Space>
        </Space>
      </Card>

      <div style={{ padding: "12px 0" }}>
        <div style={{ marginBottom: 12 }}>
          <Text strong>已选硬币：</Text>
          {step.picked.length === 0 && (
            <Text type="secondary">（还没有拿硬币）</Text>
          )}
          {step.picked.map((c, i) => (
            <span
              key={i}
              className="coin-chip"
              style={{ width: 34, height: 34, fontSize: 13 }}
            >
              {c}
            </span>
          ))}
        </div>
        <Space size="large" wrap>
          <Tag color="orange">剩余金额：{step.remaining}</Tag>
          <Tag color="blue">贪心用了 {greedyCount} 枚</Tag>
          <Tag color="green">DP 最优解 {optimal} 枚</Tag>
          {greedyCount > optimal && (
            <Tag color="red">⚠ 贪心不是最优！</Tag>
          )}
        </Space>
      </div>

      <div className="step-note">
        <b>
          [{player.idx + 1}/{steps.length}]
        </b>{" "}
        {step.note}
      </div>

      {amount === 15 && coins.join() === "1,5,11" && (
        <Alert
          style={{ marginTop: 12 }}
          type="warning"
          showIcon
          message="经典反例：金额 15、面额 [1,5,11]。贪心拿 11 后只能用 1 补，共 5 枚；最优解是 5+5+5 共 3 枚。贪心成立需要问题具有『贪心选择性质』，人民币面额体系恰好满足。"
        />
      )}
    </div>
  );
}

const extraProblems = [
  {
    title: "分发饼干（LeetCode 455）",
    body: "每个孩子只有一个胃口值，每块饼干只有一个尺寸。把饼干按尺寸升序、孩子按胃口升序排序，用最小的饼干优先满足胃口最小的孩子——经典的『双指针 + 排序贪心』。",
    code: `function findContentChildren(children, cookies) {
  children.sort((a, b) => a - b);
  cookies.sort((a, b) => a - b);
  let i = 0;                              // 指向孩子
  for (let j = 0; j < cookies.length && i < children.length; j++) {
    if (cookies[j] >= children[i]) i++;   // 这块饼干能喂饱第 i 个孩子
  }
  return i;                               // 被满足的孩子数量
}`,
  },
  {
    title: "跳跃游戏（LeetCode 55）",
    body: "数组每个元素表示在该位置最多能跳多远，判断能否到达最后一个下标。维护『当前能到达的最远位置』，逐个格子刷新它；一旦最远位置落后于当前格子就失败。",
    code: `function canJump(nums) {
  let farthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthest) return false;       // 到不了第 i 格
    farthest = Math.max(farthest, i + nums[i]);
    if (farthest >= nums.length - 1) return true;
  }
  return true;
}`,
  },
  {
    title: "无重叠区间（LeetCode 435）",
    body: "求最少移除多少个区间使剩余区间互不重叠。与活动选择同源：按右端点排序，尽可能多地保留区间，总数减去保留数就是答案。",
    code: `function eraseOverlapIntervals(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);   // 按右端点排序
  let keep = 0, lastEnd = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= lastEnd) { keep++; lastEnd = e; }
  }
  return intervals.length - keep;
}`,
  },
];

export default function Greedy() {
  return (
    <div>
      <Title level={3}>贪心算法</Title>
      <Alert
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        message="贪心算法：每一步都选择当前看起来最优的选项，期望最终得到全局最优。它简单高效，但只有问题具备『贪心选择性质 + 最优子结构』时才正确——否则会掉进反例陷阱。"
      />

      <Tabs
        size="large"
        items={[
          {
            key: "interval",
            label: "区间调度（活动选择）",
            children: (
              <div>
                <IntervalDemo />
                <Card size="small" style={{ marginTop: 8 }}>
                  <Paragraph>
                    <b>问题：</b>n 个活动各自占用一段时间，一个时间只能进行一个活动，
                    问最多能参加多少个互不冲突的活动？
                  </Paragraph>
                  <Paragraph>
                    <b>贪心策略：</b>每次都选<b>结束时间最早</b>的活动。直觉是：越早结束，
                    给后面活动留出的时间越多。按结束时间排序后，只要活动的开始时间不早于上一个
                    已选活动的结束时间，就选它。可以严格证明该策略得到的解数就是全局最大值
                    （交换论证：任何最优解都可以逐步替换成贪心解而不减少数量）。
                  </Paragraph>
                  <Paragraph>
                    <b>复杂度：</b>排序 O(n log n) + 线性扫描 O(n) = O(n log n)。
                  </Paragraph>
                </Card>
                <CodeBlock
                  title="区间调度 · JavaScript 实现"
                  code={`
function activitySelection(intervals) {
  // 1. 按结束时间排序（关键！）
  const sorted = [...intervals].sort((a, b) => a.end - b.end);
  const chosen = [];
  let lastEnd = -Infinity;

  for (const it of sorted) {
    if (it.start >= lastEnd) {   // 与已选活动不冲突
      chosen.push(it);
      lastEnd = it.end;          // 更新边界
    }
  }
  return chosen;
}
`}
                />
              </div>
            ),
          },
          {
            key: "coin",
            label: "找零钱问题",
            children: (
              <div>
                <CoinDemo />
                <Card size="small" style={{ marginTop: 8 }}>
                  <Paragraph>
                    <b>问题：</b>用最少数量的硬币凑出指定金额。
                  </Paragraph>
                  <Paragraph>
                    <b>贪心策略：</b>每次都拿当前还能拿的最大面额。
                    对人民币面额 [1, 5, 10, 20, 50, 100] 这样「大面额能被小面额线性表示」的体系，
                    贪心恰好是最优的。但把面额换成 [1, 5, 11]，贪心就会失败——
                    这说明<b>贪心不是万能钥匙</b>，使用前必须论证贪心选择性质；
                    无法论证时，用动态规划求解更稳妥（本页右侧「动态规划」分类就是它的解法）。
                  </Paragraph>
                  <Paragraph>
                    <b>复杂度：</b>贪心 O(n·k)（k 为面额数）；DP 为 O(n·k)，
                    其中 n 是金额。
                  </Paragraph>
                </Card>
                <CodeBlock
                  title="找零钱（贪心版） · JavaScript 实现"
                  code={`
function coinChangeGreedy(amount, coins) {
  const sorted = [...coins].sort((a, b) => b - a); // 从大到小
  const picked = [];
  let remaining = amount;

  for (const c of sorted) {
    while (remaining >= c) {   // 当前面额能拿就一直拿
      picked.push(c);
      remaining -= c;
    }
  }
  return remaining === 0 ? picked : null; // null 表示凑不出
}
`}
                />
              </div>
            ),
          },
          {
            key: "more",
            label: "更多经典贪心",
            children: (
              <Row gutter={[16, 16]}>
                {extraProblems.map((p) => (
                  <Col xs={24} md={12} key={p.title}>
                    <Card size="small" title={p.title} style={{ height: "100%" }}>
                      <Paragraph style={{ textAlign: "justify" }}>{p.body}</Paragraph>
                      <CodeBlock code={p.code} title="JavaScript 实现" />
                    </Card>
                  </Col>
                ))}
              </Row>
            ),
          },
        ]}
      />
    </div>
  );
}
