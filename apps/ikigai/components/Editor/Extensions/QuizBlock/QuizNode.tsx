import { mergeAttributes, Node, NodeViewProps } from "@tiptap/core";
import React from "react";

import { NodeConfig, ReactNodeViewRenderer } from "@tiptap/react";
import { EMPTY_UUID } from "util/FileUtil";

export type QuizBlockOptions = {
  pageContentId: string;
};

export default function createQuizNode<S = any>(
  name: string,
  tag: string,
  quizComponent: (props: NodeViewProps) => React.ReactNode,
  config?: Partial<NodeConfig<any, any>>,
) {
  return new Node<QuizBlockOptions, S>({
    name,
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
        quizId: {
          default: EMPTY_UUID,
        },
        originalQuizId: {
          default: EMPTY_UUID,
        },
      };
    },

    parseHTML() {
      return [{ tag }];
    },

    renderHTML({ HTMLAttributes }) {
      return [tag, mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
      return ReactNodeViewRenderer(quizComponent);
    },
    ...config,
  });
}
