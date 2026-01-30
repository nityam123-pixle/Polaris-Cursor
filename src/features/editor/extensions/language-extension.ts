import { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { rust } from "@codemirror/lang-rust";
import { cpp } from "@codemirror/lang-cpp";
import { sql } from "@codemirror/lang-sql";
import { php } from "@codemirror/lang-php";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { go } from "@codemirror/lang-go";
import { sass } from "@codemirror/lang-sass";
import { less } from "@codemirror/lang-less";
import { wast } from "@codemirror/lang-wast";
import { jinja } from "@codemirror/lang-jinja";
import { liquid } from "@codemirror/lang-liquid";

export const getLanguageExtension = (filename: string): Extension => {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":
      return javascript();

    case "jsx":
      return javascript({ jsx: true });

    case "ts":
      return javascript({ typescript: true });

    case "tsx":
      return javascript({ typescript: true, jsx: true });

    case "html":
      return html();

    case "css":
      return css();

    case "scss":
    case "sass":
      return sass();

    case "less":
      return less();

    case "json":
      return json();

    case "md":
    case "mdx":
      return markdown();

    case "py":
      return python();

    case "java":
      return java();

    case "rs":
      return rust();

    case "c":
    case "cpp":
    case "cc":
    case "cxx":
    case "h":
    case "hpp":
      return cpp();

    case "sql":
      return sql();

    case "php":
      return php();

    case "xml":
    case "svg":
      return xml();

    case "yml":
    case "yaml":
      return yaml();

    case "go":
      return go();

    case "wat":
    case "wast":
      return wast();

    case "jinja":
    case "j2":
      return jinja();

    case "liquid":
      return liquid();

    default:
      return [];
  }
};
