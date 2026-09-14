import { useFonts, JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import CodeHighlighter from "react-native-code-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

function stripBackgrounds(style: Record<string, any>) {
  const result: Record<string, any> = {};
  for (const key in style) {
    const { background, backgroundColor, ...rest } = style[key];
    result[key] = rest;
  }
  return result;
}

const transparentAtomOneLight = stripBackgrounds(atomOneLight);

type CodeBlockProps = {
  code: string;
  language?: string | null;
};

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [fontsLoaded] = useFonts({ JetBrainsMono_400Regular });

  return (
    <CodeHighlighter
      hljsStyle={transparentAtomOneLight}
      scrollViewProps={{
        style: { backgroundColor: "transparent" },
        contentContainerStyle: { backgroundColor: "transparent" },
      }}
      language={language ?? "text"}
      textStyle={{
        fontSize: 14,
        fontFamily: fontsLoaded ? "JetBrainsMono_400Regular" : undefined,
      }}
    >
      {code}
    </CodeHighlighter>
  );
}