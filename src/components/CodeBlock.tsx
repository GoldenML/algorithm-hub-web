import { useMemo, useState } from "react";
import { Button, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "do", "break", "continue", "new", "class", "extends", "export", "import",
  "from", "default", "of", "in", "typeof", "instanceof", "null", "undefined",
  "true", "false", "this", "yield", "async", "await", "try", "catch", "throw",
  "switch", "case", "interface", "type", "implements", "void", "enum",
]);

const TOKEN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|\b(0x[\da-fA-F]+|\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)/g;

function highlight(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code))) {
    if (m.index > last) nodes.push(code.slice(last, m.index));
    if (m[1]) {
      nodes.push(
        <span key={k++} className="tok-comment">
          {m[1]}
        </span>,
      );
    } else if (m[2]) {
      nodes.push(
        <span key={k++} className="tok-string">
          {m[2]}
        </span>,
      );
    } else if (m[3]) {
      nodes.push(
        <span key={k++} className="tok-number">
          {m[3]}
        </span>,
      );
    } else if (m[4]) {
      const w = m[4];
      if (KEYWORDS.has(w)) {
        nodes.push(
          <span key={k++} className="tok-keyword">
            {w}
          </span>,
        );
      } else if (/^[A-Z]/.test(w)) {
        nodes.push(
          <span key={k++} className="tok-type">
            {w}
          </span>,
        );
      } else {
        nodes.push(w);
      }
    }
    last = m.index + m[0].length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}

interface CodeBlockProps {
  code: string;
  title?: string;
}

export default function CodeBlock({ code, title }: CodeBlockProps) {
  const highlighted = useMemo(() => highlight(code.trim()), [code]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      message.success("已复制到剪贴板");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      message.error("复制失败，请手动选择复制");
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{title ?? "JavaScript 实现"}</span>
        <Button
          size="small"
          type="text"
          icon={<CopyOutlined />}
          onClick={handleCopy}
          style={{ color: "#d6deeb" }}
        >
          {copied ? "已复制" : "复制"}
        </Button>
      </div>
      <pre>
        <code>{highlighted}</code>
      </pre>
    </div>
  );
}
