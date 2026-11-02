import { Alert, Divider, Space, Tag, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import CodeBlock from "./CodeBlock";
import type { Complexity } from "@algorithms/types";

const { Title } = Typography;

function complexityColor(s: string): string {
  if (s.includes("n²")) return "red";
  if (s.includes("n log n")) return "orange";
  if (s.includes("V+E")) return "green";
  if (s.includes("log")) return "orange";
  if (s.includes("n") || s.includes("V")) return "green";
  return "blue";
}

interface AlgoExplainProps {
  idea: string;
  description: string[];
  complexity: Complexity;
  code: string;
  codeTitle?: string;
}

/** 算法详解区：思想 + 分段详解 + 复杂度标签 + 代码 */
export default function AlgoExplain({
  idea,
  description,
  complexity,
  code,
  codeTitle,
}: AlgoExplainProps) {
  return (
    <div>
      <Alert type="info" showIcon message={"核心思想：" + idea} />
      <Divider titlePlacement="left" plain>
        算法详解
      </Divider>
      {description.map((p, i) => (
        <p
          key={i}
          style={{ lineHeight: 1.9, textAlign: "justify" }}
          dangerouslySetInnerHTML={{ __html: p }}
        />
      ))}
      <Divider titlePlacement="left" plain>
        复杂度分析
      </Divider>
      <Space wrap size={[8, 8]}>
        <Tag color={complexityColor(complexity.best)}>
          最好时间：{complexity.best}
        </Tag>
        <Tag color={complexityColor(complexity.average)}>
          平均时间：{complexity.average}
        </Tag>
        <Tag color={complexityColor(complexity.worst)}>
          最坏时间：{complexity.worst}
        </Tag>
        <Tag color={complexityColor(complexity.space)}>
          空间：{complexity.space}
        </Tag>
        {complexity.stable ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            稳定排序
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="warning">
            不稳定排序
          </Tag>
        )}
      </Space>
      <Divider titlePlacement="left" plain>
        <Title level={5} style={{ margin: 0 }}>
          代码实现
        </Title>
      </Divider>
      <CodeBlock code={code} title={codeTitle} />
    </div>
  );
}
