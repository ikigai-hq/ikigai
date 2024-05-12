import { Extension, InputRule } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const OPEN_REGEX = /\/(\w+)?$/;
const CLOSE_REGEX = /\/(\s|\w+\s{2}|\w+\.)/;
const SLASH_WORDS_REGEX = /\/\w+(\s+\w+)*\s*/;

export interface SlashMenuTriggerOptions {
  setToggleSlashMenu: (open: boolean) => void;
  setMatchingWord: (word: string | undefined) => void;
  setSlashRange: (range: { from: number; to: number }) => void;
}

export const SlashMenuTrigger = Extension.create<SlashMenuTriggerOptions>({
  name: "slashMenuTrigger",
  addOptions() {
    return {
      setToggleSlashMenu: () => {},
      setMatchingWord: () => {},
      setSlashRange: () => {},
    };
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("slashMenuTrigger"),
        props: {
          handleTextInput: (view, from, to, text) => {
            const { parent } = view.state.selection.$from;
            const matchingWord = SLASH_WORDS_REGEX.exec(parent.textContent);
            if (matchingWord) {
              this.options.setMatchingWord(matchingWord.input);
            }
            return false;
          },
          handleKeyDown: (view, event) => {
            // Prosemirror input rules are not triggered on backspace, however
            // we need them to be evaluted for the filter trigger to work
            // correctly. This additional handler adds inputrules-like handling.
            if (event.key === "Backspace") {
              const { parent } = view.state.selection.$from;
              const matchingWord = SLASH_WORDS_REGEX.exec(parent.textContent);
              this.options.setMatchingWord(
                matchingWord ? matchingWord.input : undefined,
              );
              return false;
            }
            return false;
          },
        },
      }),
    ];
  },
  addInputRules() {
    return [
      new InputRule({
        find: OPEN_REGEX,
        handler: ({ state, range, match }) => {
          if (match && state.selection.$from.parent.type.name === "paragraph") {
            // console.log("OPEN", match);
            console.log(range.from);
            this.options.setToggleSlashMenu(true);
            this.options.setMatchingWord(match.input);
            this.options.setSlashRange({ from: range.from, to: range.to });
          }
          return null;
        },
      }),
      new InputRule({
        find: CLOSE_REGEX,
        handler: ({ state, range, match }) => {
          if (match) {
            // console.log("CLOSE", match);
            this.options.setToggleSlashMenu(false);
            this.options.setMatchingWord(undefined);
          }
          return null;
        },
      }),
    ];
  },
});
