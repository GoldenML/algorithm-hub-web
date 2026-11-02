import { useCallback, useEffect, useRef, useState } from "react";

interface PlayerSnap {
  total: number;
  idx: number;
  playing: boolean;
}

/**
 * 通用步骤播放器：驱动所有可视化动画。
 * 内部用「快照 + 派生」方式存储：当步骤总数（total）变化时，
 * 快照自动失效并回到第 0 帧，无需在 effect 中同步 setState。
 */
export function usePlayer(total: number, defaultInterval = 160) {
  const [snap, setSnap] = useState<PlayerSnap>({
    total,
    idx: 0,
    playing: false,
  });
  const [interval, setIntervalMs] = useState(defaultInterval);
  const timer = useRef<number | null>(null);

  // total 变化时旧快照失效 => 派生为初始状态（渲染期派生，无副作用）
  const s: PlayerSnap =
    snap.total === total ? snap : { total, idx: 0, playing: false };

  const update = useCallback(
    (patch: Partial<Omit<PlayerSnap, "total">>) => {
      setSnap((prev) => {
        const base: PlayerSnap =
          prev.total === total ? prev : { total, idx: 0, playing: false };
        return { ...base, ...patch };
      });
    },
    [total],
  );

  const setIdx = useCallback(
    (value: number | ((prev: number) => number)) => {
      setSnap((prev) => {
        const base: PlayerSnap =
          prev.total === total ? prev : { total, idx: 0, playing: false };
        const idx =
          typeof value === "function"
            ? value(Math.min(base.idx, total - 1))
            : value;
        return { ...base, idx: Math.max(0, Math.min(idx, total - 1)) };
      });
    },
    [total],
  );

  const setPlaying = useCallback(
    (playing: boolean) => update({ playing }),
    [update],
  );

  const reset = useCallback(
    () => update({ idx: 0, playing: false }),
    [update],
  );

  const toEnd = useCallback(
    () => update({ idx: Math.max(total - 1, 0), playing: false }),
    [update, total],
  );

  // 播放循环：通过 setTimeout 回调推进（回调内 setState 是安全的）
  useEffect(() => {
    if (!s.playing || s.idx >= total - 1) return;
    timer.current = window.setTimeout(() => {
      setSnap((prev) => {
        const base: PlayerSnap =
          prev.total === total ? prev : { total, idx: 0, playing: false };
        const idx = base.idx + 1;
        return {
          ...base,
          idx,
          playing: idx >= total - 1 ? false : base.playing,
        };
      });
    }, interval);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [s.playing, s.idx, interval, total]);

  return {
    idx: s.idx,
    setIdx,
    playing: s.playing,
    setPlaying,
    interval,
    setIntervalMs,
    reset,
    toEnd,
    atEnd: s.idx >= total - 1,
  };
}

/** 把生成器收集成步骤数组 */
export function collect<T>(gen: Generator<T, void, unknown>): T[] {
  const out: T[] = [];
  for (const s of gen) out.push(s);
  return out;
}
