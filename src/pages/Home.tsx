import { Card, Col, Row, Tag, Typography } from "antd";
import {
  OrderedListOutlined,
  ApartmentOutlined,
  AimOutlined,
  BlockOutlined,
  SearchOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const categories = [
  {
    path: "/sorting",
    icon: <OrderedListOutlined style={{ fontSize: 28, color: "#1677ff" }} />,
    title: "排序算法",
    desc: "六大经典排序：冒泡、选择、插入、归并、快速、堆排序，柱状图逐步动画演示。",
    algos: ["冒泡排序", "选择排序", "插入排序", "归并排序", "快速排序", "堆排序"],
    tags: ["分治", "原地排序", "稳定性"],
  },
  {
    path: "/graph-search",
    icon: <ApartmentOutlined style={{ fontSize: 28, color: "#13c2c2" }} />,
    title: "深度 / 广度搜索",
    desc: "在可编辑的网格迷宫上可视化 DFS 与 BFS，理解队列与栈如何决定搜索顺序。",
    algos: ["广度优先搜索 BFS", "深度优先搜索 DFS"],
    tags: ["队列", "栈", "最短路", "回溯"],
  },
  {
    path: "/greedy",
    icon: <AimOutlined style={{ fontSize: 28, color: "#faad14" }} />,
    title: "贪心算法",
    desc: "活动选择与找零钱的交互式演示，体会贪心策略的适用条件与反例陷阱。",
    algos: ["区间调度（活动选择）", "找零钱问题", "更多经典贪心"],
    tags: ["局部最优", "反例分析"],
  },
  {
    path: "/dynamic-programming",
    icon: <BlockOutlined style={{ fontSize: 28, color: "#722ed1" }} />,
    title: "动态规划",
    desc: "爬楼梯与 0-1 背包的 DP 表格填写动画，看懂状态转移方程如何落地。",
    algos: ["爬楼梯", "0-1 背包"],
    tags: ["状态转移", "记忆化", "重叠子问题"],
  },
  {
    path: "/binary-search",
    icon: <SearchOutlined style={{ fontSize: 28, color: "#eb2f96" }} />,
    title: "二分查找",
    desc: "lo / mid / hi 指针实时动画，含左边界、右边界等变体详解。",
    algos: ["标准二分", "左边界二分", "右边界二分"],
    tags: ["有序", "O(log n)", "边界处理"],
  },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{ textAlign: "center", padding: "36px 0 28px" }}>
        <RocketOutlined style={{ fontSize: 44, color: "#1677ff" }} />
        <Title level={2} style={{ marginTop: 12 }}>
          Algorithm Hub
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16, maxWidth: 640, margin: "0 auto" }}>
          一个纯前端的算法学习站：每种算法都配有<b>可交互的可视化演示</b>、
          <b>完整的 JavaScript 代码实现</b>与<b>图文详解</b>。无需登录，打开即学。
        </Paragraph>
      </div>
      <Row gutter={[20, 20]}>
        {categories.map((c) => (
          <Col xs={24} sm={12} lg={8} key={c.path}>
            <Card
              hoverable
              onClick={() => navigate(c.path)}
              style={{ height: "100%" }}
            >
              <div style={{ marginBottom: 12 }}>{c.icon}</div>
              <Title level={4} style={{ marginTop: 0 }}>
                {c.title}
              </Title>
              <Paragraph type="secondary" style={{ minHeight: 66 }}>
                {c.desc}
              </Paragraph>
              <div style={{ marginBottom: 12 }}>
                {c.algos.map((a) => (
                  <Tag key={a}>{a}</Tag>
                ))}
              </div>
              <div>
                {c.tags.map((t) => (
                  <Tag key={t} color="blue" bordered={false}>
                    {t}
                  </Tag>
                ))}
              </div>
              <Text type="warning">点击进入 →</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
