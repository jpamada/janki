import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { LANGUAGES } from "@/constants/languages";

import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import csharp from "react-syntax-highlighter/dist/esm/languages/hljs/csharp";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import html from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import sql from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import php from "react-syntax-highlighter/dist/esm/languages/hljs/php";
import css from "react-syntax-highlighter/dist/esm/languages/hljs/css";

const languageDefs: Record<string, unknown> = {
  javascript,
  typescript,
  python,
  php,
  java,
  csharp,
  sql,
  html,
  css,
  json,
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