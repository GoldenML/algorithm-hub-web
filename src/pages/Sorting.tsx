import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Slider,
  Space,
  Tabs,
  Typography,
  Tooltip,
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
import { SORTING_ALGOS } from "@algorithms/sorting";
import type { SortStep } from "@algorithms/types";
import { collect, usePlayer } from "@hooks/usePlayer";
import AlgoExplain from "@components/AlgoExplain";

const { Title } = Typography;

function randomArray(size: number): number[] {
  return Array.from({ length: size }, () => 5 + Math.floor(Math.random() * 96));
}

export default function Sorting() {
  const [algoKey, setAlgoKey] = useState(SORTING_ALGOS[0].key);
  const [size, setSize] = useState(24);
  const [arr, setArr] = useState<number[]>(() => randomArray(24));

  const algo = SORTING_ALGOS.find((a) => a.key === algoKey) ?? SORTING_ALGOS[0];

  const steps: SortStep[] = useMemo(
    () => collect(algo.run(arr)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [arr, algoKey],
  );
  const player = usePlayer(steps.length, 60);
  const step = steps[Math.min(player.idx, steps.length - 1)];

  const maxValue = Math.max(...step.array, 1);

  const regenerate = (newSize: number) => {
    setArr(randomArray(newSize));
  };

  const barClass = (i: number): string => {
    if (step.swap && (step.swap[0] === i || step.swap[1] === i))
      return "algo-bar is-swap";
    if (step.compare && (step.compare[0] === i || step.compare[1] === i))
      return "algo-bar is-compare";
    if (step.overwrite === i) return "algo-bar is-overwrite";
    if (step.sorted.includes(i)) return "algo-bar is-sorted";
    return "algo-bar";
  };

  const tabItems = SORTING_ALGOS.map((a) => ({
    key: a.key,
    label: a.name,
    children: undefined,
  }));

  return (
    <div>
      <Title level={3}>排序算法</Title>
      <Tabs
        activeKey={algoKey}
        onChange={setAlgoKey}
        items={tabItems}
        size="large"
      />

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
          <Space wrap>
            <Tooltip title="播放 / 暂停">
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
            </Tooltip>
            <Button
              icon={<StepBackwardOutlined />}
              onClick={() => player.setIdx((i) => Math.max(0, i - 1))}
            />
            <Button
              icon={<StepForwardOutlined />}
              onClick={() =>
                player.setIdx((i) => Math.min(steps.length - 1, i + 1))
              }
            />
            <Button icon={<RedoOutlined />} onClick={player.reset}>
              重置
            </Button>
            <Button icon={<FastForwardOutlined />} onClick={player.toEnd}>
              直接看结果
            </Button>
            <span style={{ color: "#999", fontVariantNumeric: "tabular-nums" }}>
              第 {player.idx + 1} / {steps.length} 步
            </span>
          </Space>
          <Space wrap>
            <span>速度</span>
            <Slider
              min={10}
              max={400}
              value={420 - player.interval}
              onChange={(v) => player.setIntervalMs(420 - v)}
              style={{ width: 120 }}
              tooltip={{ formatter: () => undefined }}
            />
            <span>数组规模</span>
            <Slider
              min={10}
              max={40}
              value={size}
              onChange={(v) => {
                setSize(v);
              }}
              style={{ width: 120 }}
            />
            <Button icon={<SyncOutlined />} onClick={() => regenerate(size)}>
              随机打乱
            </Button>
          </Space>
        </Space>
      </Card>

      <div className="algo-bars">
        {step.array.map((v, i) => (
          <div
            key={i}
            className={barClass(i)}
            style={{ height: `${(v / maxValue) * 100}%` }}
            title={`a[${i}] = ${v}`}
          >
            {size <= 26 && <span className="bar-value">{v}</span>}
          </div>
        ))}
      </div>

      <div className="step-note">
        <b>
          [{player.idx + 1}/{steps.length}]
        </b>{" "}
        {step.note ?? " "}
      </div>

      <Card size="small" style={{ marginTop: 16 }}>
        <Space size="large" wrap>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                background: "#1677ff",
                borderRadius: 3,
                marginRight: 6,
              }}
            />
            未处理
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                background: "#faad14",
                borderRadius: 3,
                marginRight: 6,
              }}
            />
            正在比较
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                background: "#ff4d4f",
                borderRadius: 3,
                marginRight: 6,
              }}
            />
            交换 / 写回
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                background: "#52c41a",
                borderRadius: 3,
                marginRight: 6,
              }}
            />
            已就位
          </span>
        </Space>
      </Card>

      <div style={{ marginTop: 24 }}>
        <AlgoExplain
          idea={algo.idea}
          description={algo.description}
          complexity={algo.complexity}
          code={algo.code}
          codeTitle={algo.nameEn + " · JavaScript 实现"}
        />
      </div>
    </div>
  );
}
