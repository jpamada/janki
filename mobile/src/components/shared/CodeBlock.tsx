import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import CodeHighlighter from "react-native-code-highlighter";

type CodeBlockProps = {
  code: string;
  language?: string | null;
};

export default function CodeBlock({ 
  code, 
  language 
}: CodeBlockProps) {
  
  return (
    <CodeHighlighter
      hljsStyle={atomOneLight}
      language={language ?? "text"}
      scrollViewProps={{
        style: { backgroundColor: "transparent" },
        contentContainerStyle: { backgroundColor: "transparent" },
      }}
      textStyle={{
        fontSize: 14,
        fontFamily: "JetBrainsMono_400Regular",
      }}
    >
      {code}
    </CodeHighlighter>
  );
}