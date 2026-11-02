import { useMemo, useState } from "react";
import { Alert, Button, Card, Slider, Space, Tabs, Typography } from "antd";
import {
  CaretRightOutlined,
  PauseOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  RedoOutlined,
  FastForwardOutlined,
  BgColorsOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { SEARCH_ALGOS } from "@algorithms/search";
import type { GridStep } from "@algorithms/types";
import { collect, usePlayer } from "@hooks/usePlayer";
import AlgoExplain from "@components/AlgoExplain";

const { Title } = Typography;

const ROWS = 13;
const COLS = 21;
const START = 6 * COLS + 0; // 第 6 行最左
const END = 6 * COLS + (COLS - 1); // 第 6 行最右

function emptyWalls(): number[][] {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

/** 随机迷宫：随机撒墙，并保留一条从起点到终点的走廊保证可达 */
function randomMaze(): number[][] {
  const g = emptyWalls();
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (Math.random() < 0.3) g[r][c] = 1;
  // 挖一条随机游走走廊
  let r = 6,
    c = 0;
  while (c < COLS - 1) {
    g[r][c] = 0;
    if (Math.random() < 0.35) {
      const nr = Math.max(1, Math.min(ROWS - 2, r + (Math.random() < 0.5 ? 1 : -1)));
      r = nr;
    } else {
      c++;
    }
    g[r][c] = 0;
  }
  g[6][0] = 0;
  g[6][COLS - 1] = 0;
  return g;
}

export default function GraphSearch() {
  const [algoKey, setAlgoKey] = useState<"bfs" | "dfs">("bfs");
  const [walls, setWalls] = useState<number[][]>(() => randomMaze());

  const algo = SEARCH_ALGOS.find((a) => a.key === algoKey)!;

  const steps: GridStep[] = useMemo(
    () => collect(algo.run(walls, START, END, COLS)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walls, algoKey],
  );
  const player = usePlayer(steps.length, 90);

  // 根据当前帧计算 visited / frontier / path 集合
  const state = useMemo(() => {
    const visited = new Set<number>();
    let frontier = new Set<number>();
    let path = new Set<number>();
    let note = "";
    for (let i = 0; i <= Math.min(player.idx, steps.length - 1); i++) {
      const s = steps[i];
      if (s.visit !== undefined) visited.add(s.visit);
      if (s.frontier) frontier = new Set(s.frontier);
      if (s.path) path = new Set(s.path);
      note = s.note ?? note;
    }
    return { visited, frontier, path, note };
  }, [steps, player.idx]);

  const toggleWall = (r: number, c: number) => {
    if ((r * COLS + c === START) || (r * COLS + c === END)) return;
    setWalls((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      return next;
    });
  };

  const cellClass = (r: number, c: number): string => {
    const idx = r * COLS + c;
    if (idx === START) return "grid-cell is-start";
    if (idx === END) return "grid-cell is-end";
    if (walls[r][c] === 1) return "grid-cell is-wall";
    if (state.path.has(idx)) return "grid-cell is-path";
    if (state.frontier.has(idx)) return "grid-cell is-frontier";
    if (state.visited.has(idx)) return "grid-cell is-visited";
    return "grid-cell";
  };

  const tabItems = SEARCH_ALGOS.map((a) => ({
    key: a.key,
    label: a.name,
  }));

  return (
    <div>
      <Title level={3}>深度优先 / 广度优先 搜索</Title>
      <Alert
        style={{ marginBottom: 16 }}
        type="info"
        showIcon
        message="点击格子可以添加/移除墙壁（紫色是起点，紫色方格右端是终点），选择 BFS 或 DFS 观察搜索顺序的差异。"
      />

      <Tabs activeKey={algoKey} onChange={(k) => setAlgoKey(k as "bfs" | "dfs")} items={tabItems} size="large" />

      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
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
              style={{ width: 100 }}
              tooltip={{ formatter: () => undefined }}
            />
            <Button icon={<BgColorsOutlined />} onClick={() => setWalls(randomMaze())}>
              随机迷宫
            </Button>
            <Button icon={<ClearOutlined />} onClick={() => setWalls(emptyWalls())}>
              清空墙壁
            </Button>
          </Space>
        </Space>
      </Card>

      <div style={{ overflowX: "auto" }}>
        <div
          className="search-grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, 28px)` }}
        >
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => (
              <div
                key={r * COLS + c}
                className={cellClass(r, c)}
                onClick={() => toggleWall(r, c)}
                title={`(${r}, ${c})`}
              >
                {r * COLS + c === START ? "起" : r * COLS + c === END ? "终" : ""}
              </div>
            )),
          )}
        </div>
      </div>

      <div className="step-note">
        <b>
          [{player.idx + 1}/{steps.length}]
        </b>{" "}
        {state.note}
      </div>

      <Card size="small" style={{ marginTop: 16 }}>
        <Space size="large" wrap>
          {[
            ["#722ed1", "起点 / 终点"],
            ["#34495e", "墙壁"],
            ["#a6d3ff", "已访问"],
            ["#ffc53d", "队列/栈中"],
            ["#52c41a", "最终路径"],
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
