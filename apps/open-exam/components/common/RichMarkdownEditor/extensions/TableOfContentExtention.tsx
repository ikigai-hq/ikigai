"use client";
import React, { useMemo } from "react";
import { EditorView } from "prosemirror-view";
import { TextSelection } from "prosemirror-state";
import useEditorActionStore from "context/ZustandEditorAction";
import {
  Content,
  ContentItem,
  ListModule,
} from "components/Document/LeftPanel/common";
import Router from "next/router";
import { Text, TextWeight } from "components/common/Text";
import { useTheme } from "styled-components";

type TableOfContentProps = {
  editorView: EditorView;
  getHeadings: () => {
    title: string;
    level: number;
    id: string;
    offset: number;
  }[];
};

export const TableOfContent: React.FC<TableOfContentProps> = ({
  editorView,
  getHeadings,
}) => {
  const theme = useTheme();
  const editorState = useEditorActionStore(
    (state) => state.currentPointingEditorState,
  );

  const headings = useMemo(() => {
    if (editorState) {
      return getHeadings();
    }
    return [];
  }, [editorState]);

  return (
    <div>
      {headings.length ? (
        <ListModule>
          {headings?.length > 0 && (
            <Content>
              {headings.map((h) => (
                <ContentItem
                  onClick={() => {
                    const resolvePos = editorState?.tr.doc.resolve(h.offset);
                    const transaction = editorState?.tr.setSelection(
                      TextSelection.near(resolvePos),
                    );
                    editorView?.dispatch(transaction);
                    editorView?.focus();
                    Router.push({ hash: h.id });
                  }}
                  key={h.id}
                  $level={h.level}
                >
                  <Text
                    weight={TextWeight.medium}
                    level={2}
                    color={theme.colors.gray[6]}
                  >
                    {h.title}
                  </Text>
                </ContentItem>
              ))}
            </Content>
          )}
        </ListModule>
      ) : (
        <div>Add headings (h1, h2, h3) to view a table of contents.</div>
      )}
    </div>
  );
};
