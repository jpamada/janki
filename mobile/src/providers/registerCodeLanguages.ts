import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import csharp from "react-syntax-highlighter/dist/esm/languages/hljs/csharp";
import { LANGUAGES } from "@/constants/languages";

const languageDefs: Record<string, unknown> = {
  javascript,
  python,
  sql,
  csharp,
};

for (const [name, def] of Object.entries(languageDefs)) {
  SyntaxHighlighter.registerLanguage(name, def);
}

if (__DEV__) {
  const missing = LANGUAGES.filter((lang) => !(lang in languageDefs));
  if (missing.length > 0) {
    console.warn(
      `[registerCodeLanguages] LANGUAGES includes languages with no hljs registration: ${missing.join(", ")}.`
    );
  }
}