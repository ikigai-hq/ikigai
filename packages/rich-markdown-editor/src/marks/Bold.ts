import { toggleMark } from "prosemirror-commands";
import markInputRule from "../lib/markInputRule";
import Mark from "./Mark";
import customizeEmphasisRule from "../rules/emphasis";

export default class Bold extends Mark {
  get name() {
    return "strong";
  }

  get schema() {
    return {
      parseDOM: [
        { tag: "b" },
        { tag: "strong" },
        { style: "font-style", getAttrs: (value) => value === "bold" },
      ],
      toDOM: () => ["strong"],
    };
  }

  inputRules({ type }) {
    return [markInputRule(/(?:\*\*)([^*]+)(?:\*\*)$/, type)];
  }

  keys({ type }) {
    return {
      "Mod-b": toggleMark(type),
      "Mod-B": toggleMark(type),
    };
  }

  get rulePlugins() {
    return [customizeEmphasisRule()];
  }

  get toMarkdown() {
    return {
      open: "**",
      close: "**",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  parseMarkdown() {
    return { mark: "strong" };
  }
}
