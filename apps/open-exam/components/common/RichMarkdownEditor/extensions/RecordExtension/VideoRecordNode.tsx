import { NodeComponentOptions } from "@openexam/editor/dist/lib/ComponentView";
import { RecordNode } from "./RecordNode";
import { MarkdownSerializerState } from "prosemirror-markdown";
import { Node as ProseMirrorNode } from "prosemirror-model";

export const RECORD_VIDEO_BLOCK_NAME = "record_video_block";

export class VideoRecordNode extends RecordNode {
  get name() {
    return RECORD_VIDEO_BLOCK_NAME;
  }

  get inputKey(): RegExp {
    return new RegExp(/{rv/);
  }

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(`}}}${node.attrs.fileId}\n`);
    state.text(
      `${node.attrs.fileId};${node.attrs.name};${node.attrs.contentType};${node.attrs.publicUrl}`,
      false,
    );
    state.ensureNewLine();
    state.write(`}}}`);
    state.closeBlock(node);
  }

  component = (options: NodeComponentOptions) => {
    return this.renderComponent("video", options);
  };
}
