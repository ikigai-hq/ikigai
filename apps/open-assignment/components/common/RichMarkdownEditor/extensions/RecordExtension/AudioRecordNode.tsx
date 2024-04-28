import { NodeComponentOptions } from "@open-assignment/editor/dist/lib/ComponentView";
import { RecordNode } from "./RecordNode";
import { MarkdownSerializerState } from "prosemirror-markdown";
import { Node as ProseMirrorNode } from "prosemirror-model";

export const RECORD_AUDIO_BLOCK_NAME = "record_audio_block";

export class AudioRecordNode extends RecordNode {
  get name() {
    return RECORD_AUDIO_BLOCK_NAME;
  }

  component = (options: NodeComponentOptions) => {
    return this.renderComponent("audio", options);
  };

  toMarkdown(state: MarkdownSerializerState, node: ProseMirrorNode) {
    state.write(`{{{${node.attrs.fileId}\n`);
    state.text(
      `${node.attrs.fileId};${node.attrs.name};${node.attrs.contentType};${node.attrs.publicUrl}`,
      false,
    );
    state.ensureNewLine();
    state.write(`{{{`);
    state.closeBlock(node);
  }

  get inputKey(): RegExp {
    return new RegExp(/{ra/);
  }
}
