import { mergeAttributes, Node } from "@tiptap/core";
import {
  CommandProps,
  RawCommands,
  ReactNodeViewRenderer,
} from "@tiptap/react";

import FileHandlerComponent from "./FileHandlerComponent";
import { EMPTY_UUID } from "util/FileUtil";

export type FileHandlerOptions = {
  pageContentId: string;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customExtension: {
      insertFileHandler: (file?: File) => ReturnType;
    };
  }
}

export const FILE_HANDLER_NAME = "fileHandler";

export default Node.create<FileHandlerOptions>({
  name: FILE_HANDLER_NAME,
  group: "block",
  atom: true,
  selectable: true,

  addOptions() {
    return {
      pageContentId: EMPTY_UUID,
    };
  },

  addAttributes() {
    return {
      fileId: {
        default: EMPTY_UUID,
      },
      file: {
        default: undefined,
      },
    };
  },

  addCommands(): Partial<RawCommands> {
    return {
      insertFileHandler:
        (file) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent([
            {
              type: FILE_HANDLER_NAME,
              attrs: {
                file,
              },
            },
          ]);
        },
    };
  },

  parseHTML() {
    return [
      {
        tag: "file-handler-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["file-handler-component", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileHandlerComponent);
  },
});
