import { FileAttrs, FileNodeAttrs, Size } from "./type";
import { EditorView } from "prosemirror-view";
import FileBlock from "./FileBlock";
import { useState } from "react";

interface Props {
  documentId: string;
  size: Size;
  name: string;
  files: FileAttrs[];
  onChangeAttrs: (newAttrs: Partial<FileNodeAttrs>) => void;
  onDelete: () => void;
  view?: EditorView;
  isSelected: boolean;
  handleSelect: () => void;
  audioSubmissionReplay?: boolean;
}

export const FileExtension: React.FC<Props> = ({
  documentId,
  size,
  name,
  files,
  view,
  onDelete,
  onChangeAttrs,
  isSelected,
  handleSelect,
  audioSubmissionReplay,
}) => {
  const [isFullScreen, setFullScreen] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        height: isFullScreen ? size.height : "auto",
      }}
    >
      <FileBlock
        documentId={documentId}
        size={size}
        name={name}
        files={files}
        view={view}
        onDelete={onDelete}
        onChangeAttrs={onChangeAttrs}
        isSelected={isSelected}
        handleSelect={handleSelect}
        isFullScreen={isFullScreen}
        setFullScreen={setFullScreen}
        audioSubmissionReplay={audioSubmissionReplay}
      />
    </div>
  );
};
