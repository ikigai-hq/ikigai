import { toggleMark } from "prosemirror-commands";
import Mark from "../marks/Mark";
import markRule from "../rules/mark";
import { InputRule } from "prosemirror-inputrules";
import { EditorView } from "prosemirror-view";
import { parseColorName } from "../util/parseColorName";

export default class ColorText extends Mark {
  get name() {
    return "colorText";
  }

  get schema() {
    return {
      attrs: {
        color: {
          default: "",
        },
        bg: {
          default: "",
        },
      },
      parseDOM: [
        {
          tag: "span.inline-text-color",
          getAttrs: (dom: HTMLDivElement) => {
            return {
              color: dom.getAttribute("color"),
              bg: dom.getAttribute("bg"),
            };
          },
        },
      ],
      toDOM: (node) => {
        return [
          "span",
          node.attrs.color || node.attrs.bg
            ? {
                class: "inline-text-color",
                style: `color:${node.attrs.color};background:${node.attrs.bg};`,
                color: node.attrs.color,
                bg: node.attrs.bg,
              }
            : { class: "inline-text-color" },
        ];
      },
    };
  }

  commands({ type }) {
    return (attrs: { [key: string]: any }, view?: EditorView) => {
      if (view) {
        const { state, dispatch } = view;
        const { selection, tr } = state;
        const { from, to } = selection;
        const isHasRangeMark = state.doc.rangeHasMark(from, to, type);

        if (isHasRangeMark) {
          const tr = state.tr.removeMark(from, to, type);
          dispatch(tr);
          return toggleMark(type, attrs);
        }

        dispatch(tr.removeStoredMark(type));
        return toggleMark(type, attrs);
      }

      return toggleMark(type, attrs);
    };
  }

  inputRules({ type }) {
    return [
      new InputRule(/(?:@@)([^=]+)(?:@@)$/, (state, match, start, end) => {
        const [okay, matchedText] = match;
        const { tr, schema } = state;

        if (okay) {
          const words = matchedText.split(";#;");
          tr.replaceWith(start, end, schema.text(words[0])).addMark(
            start,
            start + words[0].length,
            type.create({ color: words[1] })
          );
        }

        return tr;
      }),
    ];
  }

  get rulePlugins() {
    return [markRule({ delim: "@@", mark: "colorText" })];
  }

  get toMarkdown() {
    return {
      open(_state, mark) {
        return `@@color:${mark.attrs.color ? mark.attrs.color : null}-bg:${
          mark.attrs.bg ? mark.attrs.bg : null
        };#;`;
      },
      close: "@@",
      mixable: true,
      expelEnclosingWhitespace: true,
    };
  }

  parseMarkdown() {
    return {
      mark: "colorText",
      getAttrs: (tok) => {
        const parsedObject = parseColorName(tok.info);
        return {
          color: parsedObject?.color || null,
          bg: parsedObject?.bg || null,
        };
      },
    };
  }
}
