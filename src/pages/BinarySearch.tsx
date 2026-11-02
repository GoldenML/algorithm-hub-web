import { useMemo, useState } from "react";
import { Alert, Button, Card, Space, InputNumber, Typography } from "antd";
import {
  CaretRightOutlined,
  PauseOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  RedoOutlined,
  FastForwardOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { binarySearch } from "@algorithms/binary";
import type { BinaryStep } from "@algorithms/binary";
import { collect, usePlayer } from "@hooks/usePlayer";
import AlgoExplain from "@components/AlgoExplain";

const { Title, Paragraph, Text } = Typography;

function randomSortedArray(): number[] {
  const set = new Set<number>();
  while (set.size < 15) set.add(1 + Math.floor(Math.random() * 99));
  return [...set].sort((a, b) => a - b);
}

const BOUND_CODE = `
// 标准二分：找到 target 就返回下标，找不到返回 -1
function binarySearch(a, target) {
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] === target) return mid;
    else if (a[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

// 左边界二分：返回第一个 >= target 的下标（lowerBound）
function lowerBound(a, target) {
  let lo = 0, hi = a.length;         // 注意 hi 是开区间
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < target) lo = mid + 1;
    else hi = mid;                   // mid 可能就是答案，不能丢
  }
  return lo;
}

// 右边界二分：返回最后一个 <= target 的下标（upperBound - 1）
function upperBound(a, target) {
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo - 1;
}
`;

export default function BinarySearch() {
  const [arr, setArr] = useState<number[]>(() => randomSortedArray());
  const [target, setTarget] = useState<number>(() => arr[7]);

  const steps: BinaryStep[] = useMemo(
    () => collect(binarySearch(arr, target)),
    [arr, target],
  );
  const player = usePlayer(steps.length, 800);
  const step = steps[Math.min(player.idx, steps.length - 1)];

  const maxValue = Math.max(...arr, 1);

  const barClass = (i: number): string => {
    if (step.found && arr[step.mid] === target && i === step.mid)
      return "viz-bar is-found";
    if (i === step.mid) return "viz-bar is-mid";
    if (i < step.lo || i > step.hi) return "viz-bar is-out";
    if (i >= step.lo && i <= step.hi) return "viz-bar is-lo";
    return "viz-bar";
  };

  const shuffle = () => {
    const next = randomSortedArray();
    setArr(next);
    setTarget(next[Math.floor(Math.random() * next.length)]);
  };

  return (
    <div>
      <Title level={3}>二分查找</Title>
      <Alert
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        message="二分查找：在有序数组中，每次用中间元素把搜索区间砍掉一半，O(log n) 次比较即可定位目标。核心难点全在边界的处理上。"
      />

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
          <Space wrap>
            <span>查找目标</span>
            <InputNumber min={1} max={99} value={target} onChange={(v) => v && setTarget(v)} />
            <span style={{ color: "#999", fontSize: 12 }}>
              数组：{arr.join(", ")}
            </span>
            <Button icon={<SyncOutlined />} onClick={shuffle}>换一组</Button>
          </Space>
        </Space>
      </Card>

      <div className="viz-bars" style={{ height: 260 }}>
        {arr.map((v, i) => (
          <div
            key={i}
            className={barClass(i)}
            style={{ height: `${(v / maxValue) * 100}%` }}
            title={`a[${i}] = ${v}`}
          >
            <span className="bar-value">{v}</span>
            <span className="bar-tag">
              {i === step.mid ? "mid" : ""}
              {i === step.lo && i !== step.mid ? "lo" : ""}
              {i === step.hi && i !== step.mid ? "hi" : ""}
            </span>
          </div>
        ))}
      </div>

      <div className="step-note" style={{ marginTop: 28 }}>
        <b>
          [{player.idx + 1}/{steps.length}]
        </b>{" "}
        {step.note}
      </div>

      <Card size="small" style={{ marginTop: 16 }}>
        <Space size="large" wrap>
          {[
            ["#bae0ff", "当前搜索区间 [lo, hi]"],
            ["#faad14", "mid 中点"],
            ["#52c41a", "找到目标"],
            ["#d9d9d9", "已排除"],
          ].map(([color, label]) => (
            <span key={label}>
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  background: color,
                  borderRadius: 3,
                  marginRight: 6,
                }}
              />
              {label}
            </span>
          ))}
        </Space>
      </Card>

      <div style={{ marginTop: 24 }}>
        <AlgoExplain
          idea="每次取区间中点与目标比较，排除掉不可能的一半，区间规模对数级缩小。"
          description={[
            "二分查找的前提是数据<b>有序（或具有单调性）</b>。维护闭区间 [lo, hi] 表示『目标可能存在的范围』：取 mid = (lo+hi)/2，若 a[mid] 恰好等于目标则命中；若 a[mid] < 目标，说明目标只可能在右半区，令 lo = mid+1；反之令 hi = mid-1。区间每轮减半，15 个元素最多 4 次比较，100 万个元素最多 20 次——这就是 O(log n) 的含义。",
            "一个常见误区是 mid 用 (lo+hi)/2 计算：在某些语言里大数相加会溢出，标准写法是 mid = lo + (hi-lo)/2。JS 的 Number 足够大不必担心，但面试中写对更稳妥。",
            "二分真正的难点是<b>边界变体</b>：找『第一个 ≥ target 的位置』（左边界）或『最后一个 ≤ target 的位置』（右边界）。左边界写法中，a[mid] >= target 时不能直接返回，因为 mid 可能不是第一个，要令 hi = mid 继续收缩；循环条件也从 lo <= hi 变为 lo < hi，hi 初始为 a.length（右开区间）。记住一个万能模板：while (lo < hi) + 永远收缩 + 结束时 lo === hi 即答案所在。",
            "更进一步，『二分答案』是二分思想最重要的应用：如果答案具有单调性（例如『运 10 天一定可行、运 1 天一定不可行』），就可以对答案本身二分，把最优化问题转化为判定问题。LeetCode 410、875、1011 都是这个套路。",
          ]}
          complexity={{
            best: "O(1)",
            average: "O(log n)",
            worst: "O(log n)",
            space: "O(1)",
            stable: true,
          }}
          code={BOUND_CODE}
          codeTitle="二分查找及边界变体 · JavaScript 实现"
        />
      </div>

      <Card size="small" style={{ marginTop: 16 }}>
        <Paragraph>
          <Text strong>试一试：</Text>
          把查找目标改成一个数组里不存在的值（比如 50 若不在数组中），
          观察动画如何一步步把区间缩空，最后以 lo &gt; hi 判定「不存在」。
          这正是标准二分找不到时返回 -1 的原理。
        </Paragraph>
      </Card>
    </div>
  );
}
