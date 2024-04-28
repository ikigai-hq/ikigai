import { FeedbackTextAttrs } from "./index";
import { FormEvent, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { EditorView } from "prosemirror-view";
import { copyBlock } from "@open-assignment/editor/dist/util/copyBlock";
import { t } from "@lingui/macro";

export type FeedbackTextBlockProps = {
  attrs: FeedbackTextAttrs;
  onChange: (attrs: Partial<FeedbackTextAttrs>) => void;
  view?: EditorView;
  readonly: boolean;
};

const FeedbackTextBlock = ({
  attrs,
  onChange,
  view,
  readonly,
}: FeedbackTextBlockProps) => {
  const spanInput = useMemo(() => {
    return (
      <FeedbackSpanInput
        attrs={attrs}
        onChange={onChange}
        readonly={readonly}
      />
    );
  }, []);

  return (
    <div
      style={{ display: "inline-flex" }}
      onCopy={(e) => copyBlock(view, e as any)}
    >
      {spanInput}
    </div>
  );
};

const FeedbackSpanInput = ({
  attrs,
  onChange,
  readonly,
}: FeedbackTextBlockProps) => {
  const inputRef = useRef(null);
  useEffect(() => {
    if (attrs.autoFocus) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const onChangeFeedback = (e: FormEvent<HTMLSpanElement>) => {
    const feedback = e.currentTarget.textContent;
    onChange({ feedback });
  };

  return (
    <InputSpan
      id={attrs.id}
      role="textbox"
      contentEditable={!readonly}
      onInput={onChangeFeedback}
      ref={inputRef}
      placeholder={t`feedback`}
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          return false;
        }
      }}
    >
      {attrs.feedback || ""}
    </InputSpan>
  );
};

export const InputSpan = styled.span`
  background-color: #465a3d;
  color: #ffffff;
  padding-left: 2px;
  padding-right: 2px;
`;

export default FeedbackTextBlock;
