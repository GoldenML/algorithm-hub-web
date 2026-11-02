import type { SortAlgoMeta, SortStep, SortGenerator } from "./types";

function done(a: number[], note = "排序完成 🎉"): SortStep {
  return { array: [...a], sorted: a.map((_, i) => i), note };
}

/** 冒泡排序 */
export function* bubbleSort(input: number[]): SortGenerator {
  const a = [...input];
  const n = a.length;
  const sorted: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      yield {
        array: [...a],
        compare: [j, j + 1],
        sorted: [...sorted],
        note: "比较相邻两个元素，前者更大则交换",
      };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        yield { array: [...a], swap: [j, j + 1], sorted: [...sorted] };
      }
    }
    sorted.unshift(n - 1 - i);
    if (!swapped) break; // 提前退出优化
  }
  yield done(a);
}

/** 选择排序 */
export function* selectionSort(input: number[]): SortGenerator {
  const a = [...input];
  const n = a.length;
  const sorted: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    yield { array: [...a], compare: [i, i], sorted: [...sorted], note: "假定当前位置是最小值" };
    for (let j = i + 1; j < n; j++) {
      yield { array: [...a], compare: [min, j], sorted: [...sorted], note: "在未排序区间寻找最小值" };
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      yield { array: [...a], swap: [i, min], sorted: [...sorted], note: "把最小值换到当前位置" };
    }
    sorted.push(i);
  }
  yield done(a);
}

/** 插入排序 */
export function* insertionSort(input: number[]): SortGenerator {
  const a = [...input];
  const n = a.length;
  const sorted: number[] = [0];
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    yield { array: [...a], compare: [i, i], sorted: [...sorted], note: "取出待插入的牌 " + key };
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      yield { array: [...a], overwrite: j + 1, sorted: [...sorted], note: "比 " + key + " 大的元素右移一位" };
      j--;
    }
    a[j + 1] = key;
    sorted.push(i);
    yield { array: [...a], overwrite: j + 1, sorted: [...sorted], note: "将 " + key + " 插入正确位置" };
  }
  yield done(a);
}

/** 归并排序 */
export function* mergeSort(input: number[]): SortGenerator {
  const a = [...input];
  const buf = new Array(a.length);

  function* sort(lo: number, hi: number): SortGenerator {
    if (hi - lo <= 1) return;
    const mid = (lo + hi) >> 1;
    yield* sort(lo, mid);
    yield* sort(mid, hi);
    // 合并两个有序区间
    let i = lo,
      j = mid,
      k = lo;
    while (i < mid && j < hi) {
      yield {
        array: [...a],
        compare: [i, j],
        sorted: [],
        note: "合并阶段：比较左右两段的队首元素",
      };
      buf[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    }
    while (i < mid) buf[k++] = a[i++];
    while (j < hi) buf[k++] = a[j++];
    for (let t = lo; t < hi; t++) {
      a[t] = buf[t];
      yield {
        array: [...a],
        overwrite: t,
        sorted: [],
        note: "写回归并结果",
      };
    }
  }

  yield* sort(0, a.length);
  yield done(a);
}

/** 快速排序（Lomuto 分区） */
export function* quickSort(input: number[]): SortGenerator {
  const a = [...input];
  const sorted: number[] = [];

  function* partition(lo: number, hi: number): Generator<SortStep, number, unknown> {
    const pivot = a[hi];
    yield { array: [...a], compare: [hi, hi], sorted: [...sorted], note: "选取最右元素 " + pivot + " 作为基准" };
    let i = lo;
    for (let j = lo; j < hi; j++) {
      yield {
        array: [...a],
        compare: [j, hi],
        sorted: [...sorted],
        note: a[j] + (a[j] < pivot ? " < " : " ≥ ") + pivot + (a[j] < pivot ? "，换到左侧区域" : "，留在右侧"),
      };
      if (a[j] < pivot) {
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          yield { array: [...a], swap: [i, j], sorted: [...sorted] };
        }
        i++;
      }
    }
    if (i !== hi) {
      [a[i], a[hi]] = [a[hi], a[i]];
    }
    yield { array: [...a], swap: [i, hi], sorted: [...sorted], note: "基准归位到下标 " + i };
    return i;
  }

  function* sort(lo: number, hi: number): SortGenerator {
    if (lo >= hi) {
      if (lo === hi) sorted.push(lo);
      return;
    }
    const p = yield* partition(lo, hi);
    sorted.push(p);
    yield* sort(lo, p - 1);
    yield* sort(p + 1, hi);
  }

  yield* sort(0, a.length - 1);
  yield done(a);
}

/** 堆排序 */
export function* heapSort(input: number[]): SortGenerator {
  const a = [...input];
  const n = a.length;
  const sorted: number[] = [];

  function* siftDown(start: number, end: number): SortGenerator {
    let root = start;
    while (root * 2 + 1 < end) {
      const child = root * 2 + 1;
      let swapIdx = root;
      yield {
        array: [...a],
        compare: [root, child],
        sorted: [...sorted],
        note: "下沉：父节点与子节点比较",
      };
      if (a[swapIdx] < a[child]) swapIdx = child;
      if (child + 1 < end) {
        yield { array: [...a], compare: [swapIdx, child + 1], sorted: [...sorted] };
        if (a[swapIdx] < a[child + 1]) swapIdx = child + 1;
      }
      if (swapIdx === root) return;
      [a[root], a[swapIdx]] = [a[swapIdx], a[root]];
      yield { array: [...a], swap: [root, swapIdx], sorted: [...sorted] };
      root = swapIdx;
    }
  }

  // 建堆
  for (let i = (n >> 1) - 1; i >= 0; i--) {
    yield* siftDown(i, n);
  }
  yield { array: [...a], sorted: [...sorted], note: "大顶堆建立完成，堆顶是最大值" };
  // 排序
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    sorted.push(end);
    yield { array: [...a], swap: [0, end], sorted: [...sorted], note: "堆顶（最大值）放到末尾" };
    yield* siftDown(0, end);
  }
  yield done(a);
}

export const SORTING_ALGOS: SortAlgoMeta[] = [
  {
    key: "bubble",
    name: "冒泡排序",
    nameEn: "Bubble Sort",
    tagline: "相邻比较，大的像气泡一样浮到最后",
    idea: "每一轮从头到尾两两比较相邻元素，把最大的元素『冒泡』到末尾，重复 n-1 轮。",
    description: [
      "冒泡排序是最直观的入门排序：从头开始，比较相邻的两个元素，如果前一个比后一个大就交换它们。这样一轮下来，最大的元素一定会被『推』到数组末尾。下一轮只需要处理前面剩下的部分，所以内层循环的范围每轮减一。",
      "两个重要优化：① 如果某一整轮都没有发生交换，说明数组已经有序，可以提前结束（本页演示已内置该优化），最好情况时间复杂度因此降为 O(n)；② 记录每轮最后一次交换的位置，该位置之后都是有序区，可以一次跳过多轮。",
      "冒泡排序是稳定排序（相等元素不会交换相对位置），但交换次数多、性能差，实际工程中很少使用，更多作为教学和理解『稳定性』的范例。",
    ],
    complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true },
    code: `
function bubbleSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;           // 本轮是否发生交换
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break;           // 一轮无交换 => 已经有序，提前结束
  }
  return a;
}
`,
    run: bubbleSort,
  },
  {
    key: "selection",
    name: "选择排序",
    nameEn: "Selection Sort",
    tagline: "每轮选出最小值，放到已排序区末尾",
    idea: "每轮在未排序区间中扫描一遍找出最小元素，与未排序区间的第一个元素交换。",
    description: [
      "选择排序把数组分成『已排序区』和『未排序区』。每一轮从未排序区中找出最小的元素，把它与未排序区的第一个元素交换，然后已排序区长度加一。重复 n-1 轮即可完成。",
      "它的交换次数最少——最多只有 n-1 次交换，这在『交换成本很高』的场景（例如写 Flash 存储）有一定意义。但比较次数固定为 n(n-1)/2，无论数据是否有序，性能都是 O(n²)。",
      "注意：选择排序是不稳定的。例如序列 [5a, 5b, 2]，第一轮会把 2 和 5a 交换，两个 5 的相对顺序就被破坏了。",
    ],
    complexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: false },
    code: `
function selectionSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[min]) min = j;  // 记录更小元素的下标
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
    }
  }
  return a;
}
`,
    run: selectionSort,
  },
  {
    key: "insertion",
    name: "插入排序",
    nameEn: "Insertion Sort",
    tagline: "像整理扑克牌，把新牌插到正确位置",
    idea: "从第二个元素开始，把当前元素插入到前面已排序区间的正确位置，像摸牌后整理手牌。",
    description: [
      "插入排序就像打扑克牌时整理手上的牌：每摸到一张新牌，从右往左扫描已排好的牌，把比它大的牌都往右挪一格，空出的位置就是新牌的插入点。",
      "它对『基本有序』的数据表现极好——如果数组几乎有序，内层 while 几乎不执行，整体接近 O(n)。数据量很小（n ≤ 16 左右）时，插入排序往往比快排还快，因此许多语言的标准库排序（如 TimSort）在小分段时都用它。",
      "插入排序是稳定排序，也是 O(n²) 排序中平均表现最好的一个。",
    ],
    complexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", stable: true },
    code: `
function insertionSort(arr) {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];             // 待插入的牌
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];            // 比 key 大的右移
      j--;
    }
    a[j + 1] = key;               // 插入到空出的位置
  }
  return a;
}
`,
    run: insertionSort,
  },
  {
    key: "merge",
    name: "归并排序",
    nameEn: "Merge Sort",
    tagline: "分而治之：递归拆半，合并有序段",
    idea: "递归地把数组一分为二，分别排好序后，用双指针把两个有序子数组合并成一个。",
    description: [
      "归并排序是『分治法』的经典代表。分（Divide）：把数组从中间切成两半；治（Conquer）：递归地对左右两半排序；合（Merge）：用两个指针分别指向两个有序子数组的头部，每次取较小者放入结果，直到合并完毕。",
      "合并是整个算法的灵魂：两个已经有序的数组，只要各用一根指针从头比较，O(n) 就能合并成一个更大的有序数组。递归深度是 log n 层，每层合并总量是 n，所以复杂度稳定在 O(n log n)，且与输入数据的初始顺序无关——这是它最大的优点：性能可预期。",
      "代价是需要 O(n) 的辅助数组，且是不稳定排序的『反面教材』——注意标准写法在 a[i] <= a[j] 时优先取左半段，这恰好保证了稳定性。它是稳定排序。工程中，对链表排序首选归并（无需随机访问）；外部排序（数据远大于内存）也基于多路归并。",
    ],
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)", stable: true },
    code: `
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const left = mergeSort(arr.slice(0, mid));   // 递归排左半
  const right = mergeSort(arr.slice(mid));     // 递归排右半

  // 合并两个有序数组（双指针）
  const res = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    res.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return res.concat(left.slice(i), right.slice(j));
}
`,
    run: mergeSort,
  },
  {
    key: "quick",
    name: "快速排序",
    nameEn: "Quick Sort",
    tagline: "选基准分区，平均最快的通用排序",
    idea: "选一个基准元素（pivot），把小于它的放左边、大于它的放右边，再递归处理左右两部分。",
    description: [
      "快速排序同样是分治思想，但与归并排序相反：它的工作量在『分』而不是『合』。每一轮选一个基准（这里取区间最后一个元素，Lomuto 分区方案），一趟扫描把区间划分成『小于基准』和『大于等于基准』两段，基准落在两者之间——这个位置就是它排序后的最终位置。随后对左右两段递归。",
      "平均复杂度 O(n log n)，且常数小、缓存友好、原地排序，是实践中最快的通用排序之一。最坏情况（例如对已排序数组每次都取首/尾元素为基准）会退化为 O(n²)，解决办法是随机选取基准或三数取中；本页演示为了直观固定取末尾元素。",
      "快排是不稳定排序（分区时的长距离交换会打乱相等元素的相对顺序）。JS 引擎的 Array.prototype.sort 早期版本用的就是快排变体，V8 现在改用 TimSort。",
    ],
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)", stable: false },
    code: `
function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;

  // Lomuto 分区：以 a[hi] 为基准
  const pivot = arr[hi];
  let i = lo;                       // i 左边都是 < pivot 的区域
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]]; // 基准归位

  quickSort(arr, lo, i - 1);        // 递归排左段
  quickSort(arr, i + 1, hi);        // 递归排右段
  return arr;
}
`,
    run: quickSort,
  },
  {
    key: "heap",
    name: "堆排序",
    nameEn: "Heap Sort",
    tagline: "用大顶堆反复取最大值",
    idea: "先原地建一个大顶堆，然后反复把堆顶（最大值）与末尾交换，并重新下沉调整堆。",
    description: [
      "堆排序把数组看成一棵完全二叉树：下标 i 的左孩子是 2i+1，右孩子是 2i+2。第一步自底向上『建堆』——从最后一个非叶子节点开始，逐个对节点做『下沉（sift-down）』，使每个父节点都大于等于孩子，形成大顶堆，此时堆顶就是全数组最大值。",
      "第二步反复『取堆顶』：把堆顶与当前末尾元素交换（最大值就位），堆的有效长度减一，再对新堆顶做一次下沉恢复堆性质。重复 n-1 次即完成排序。",
      "建堆的实际复杂度是 O(n)（不是直觉的 O(n log n)），每次下沉是 O(log n)，总体 O(n log n)，且空间开销 O(1)、无递归栈溢出风险。它是不稳定排序。它的思想比排序本身更重要：优先队列、Top-K 问题、多路归并都靠堆。",
    ],
    complexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)", stable: false },
    code: `
function heapSort(arr) {
  const a = [...arr];
  const n = a.length;

  // 下沉：让以 root 为根的子树满足大顶堆
  function siftDown(root, end) {
    while (root * 2 + 1 < end) {
      const child = root * 2 + 1;
      let big = root;
      if (a[big] < a[child]) big = child;
      if (child + 1 < end && a[big] < a[child + 1]) big = child + 1;
      if (big === root) break;
      [a[root], a[big]] = [a[big], a[root]];
      root = big;
    }
  }

  for (let i = (n >> 1) - 1; i >= 0; i--) siftDown(i, n); // 自底向上建堆
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]]; // 堆顶(最大)放到末尾
    siftDown(0, end);                // 恢复堆性质
  }
  return a;
}
`,
    run: heapSort,
  },
];
