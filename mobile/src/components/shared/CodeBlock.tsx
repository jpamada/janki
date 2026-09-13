import CodeHighlighter from "react-native-code-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

type CodeBlockProps = {
  code: string;
  language?: string | null;
};

export default function CodeBlock({
  code,
  language,
}: CodeBlockProps) {
  return (
    <CodeHighlighter
      hljsStyle={atomOneLight}
      language={language ?? "text"}
      textStyle={{ fontSize: 14 }}
    >
      {code}
    </CodeHighlighter>
  );
}