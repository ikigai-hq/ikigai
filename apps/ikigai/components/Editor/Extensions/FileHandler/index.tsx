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
      insertFileHandler: () => ReturnType;
    };
  }
}

export const FileHandlerExtensionName = "fileHandler";

export default Node.create<FileHandlerOptions>({
  name: FileHandlerExtensionName,
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
    };
  },

  addCommands(): Partial<RawCommands> {
    return {
      insertFileHandler:
        () =>
        ({ commands }: CommandProps) => {
          return commands.insertContent([
            {
              type: FileHandlerExtensionName,
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
