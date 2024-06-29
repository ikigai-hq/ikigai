import { Editor } from "@tiptap/react";

export const hasExtension = (editor: Editor, extensionName: string) =>
  editor &&
  editor.extensionManager.extensions.some(
    (extension) => extension.name === extensionName,
  );
