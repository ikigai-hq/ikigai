import { toggleMark } from "prosemirror-commands";
import Mark from "../marks/Mark";
import markRule from "../rules/mark";
import { InputRule } from "prosemirror-inputrules";
import { v4 as uuidv4 } from "uuid";
import { extractUUIDAndText } from "../util/regex";
import { Plugin } from "prosemirror-state";
import isMarkActive from "../queries/isMarkActive";

export default class Annotation extends Mark {
  get name() {
    return "annotation";
  }

  get schema() {
    return {
      attrs: {
        id: {
          default: "",
        },
        type: {
          default: "",
        },
      },
      parseDOM: [
        {
          tag: "span.annotation",
          getAttrs: (dom: HTMLElement) => ({
            id: dom.getAttribute("id"),
          }),
        },
      ],
      toDOM: (node) => {
        return [
          "span",
          { id: node.attrs.id, type: node.attrs.type, class: "annotation" },
        ];
      },
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleKeyDown(view, event) {
            const isActiveAnnotation = isMarkActive(
              view.state.schema.marks.annotation
            )(view.state);
            if (event.key === "Enter" && isActiveAnnotation) {
              event.preventDefault();
              return true;
            }
            return false;
          },
        },
      }),
    ];
  }

  commands({ type }) {
    return (attrs: { [key: string]: any }) => {
      if (!attrs.id) {
        attrs.id = uuidv4();
      }
      if (attrs.type === "replace") {
        attrs.type = "replace";
      }
      return toggleMark(type, attrs);
    };
  }

  inputRules({ type }) {
    return [
      new InputRule(/(?:&&)([^=]+)(?:&&)$/, (state, match, start, end) => {
        const [okay, matchedText] = match;
        const { tr, schema } = state;

        if (okay) {
          const words = matchedText.split(";#;");
          tr.replaceWith(start, end, schema.text(words[0])).addMark(
            start,
            start + words[0].length,
            type.create({ id: words[1] })
          );
        }

        return tr;
      }),
    ];
  }

  keys({ type }) {
    return {
      "Mod-Ctrl-a": toggleMark(type, { id: uuidv4() }),
    };
  }

  get rulePlugins() {
    return [markRule({ delim: "&&", mark: "annotation" })];
  }

  get toMarkdown() {
    return {
      open(_state, mark) {
        if (!mark.attrs.id) return `&&`;
        if (mark.attrs.id && mark.attrs.type === "replace")
          return `&&${mark.attrs.id}(replace);#;`;
        return `&&${mark.attrs.id};#;`;
      },
      close: "&&",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  parseMarkdown() {
    return {
      mark: "annotation",
      getAttrs: (tok) => {
        const info = extractUUIDAndText(tok.info);
        if (info) {
          return {
            id: info.uuid,
            type: info.remainingText,
          };
        }
        return {
          id: null,
        };
      },
    };
  }
}
