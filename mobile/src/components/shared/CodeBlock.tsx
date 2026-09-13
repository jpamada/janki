import SyntaxHighlighter from "react-native-syntax-highlighter";
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
    <SyntaxHighlighter
      language={language ?? "text"}
      style={atomOneLight}
      highlighter="hljs"
    >
      {code}
    </SyntaxHighlighter>
  );
}