import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const initialStyle = {
  left: -1000,
  top: 0,
};

const calculatePositon = (
  view: EditorView,
  state: EditorState,
  offsetWidth: number
) => {
  const { $anchor, $head } = state.selection;
  if (!state.selection || state.selection.empty) {
    return { left: -1000, top: 0 };
  }

  const anchorCoord = view.coordsAtPos($anchor.pos);
  const headCoord = view.coordsAtPos($head.pos);

  return {
    left: anchorCoord.left - offsetWidth / 2,
    top:
      anchorCoord.top <= headCoord.top
        ? anchorCoord.top - 38
        : headCoord.top - 38,
  };
};

export const Floater: React.FC<{
  children: React.ReactNode;
  view: EditorView;
  state: EditorState;
}> = ({ children, view, state }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [styles, setStyles] = useState<React.CSSProperties>(initialStyle);

  // trigger redraw on resize and scroll events
  useEffect(() => {
    const activeEditorEl = document?.getElementById("active-editor");

    const handleEvent = () => {
      const clientRect = menuRef?.current?.getBoundingClientRect();
      const newPos = calculatePositon(
        view,
        view.state,
        menuRef?.current?.offsetWidth || 0
      );
      setStyles({
        ...newPos,
        opacity: clientRect && clientRect.top <= 76 ? 0 : 1,
      });
    };

    window.addEventListener("resize", handleEvent);
    activeEditorEl?.addEventListener("scrollend", handleEvent);

    return () => {
      window.removeEventListener("resize", handleEvent);
      activeEditorEl?.removeEventListener("scrollend", handleEvent);
    };
  }, []);

  useEffect(() => {
    setStyles(
      calculatePositon(view, state, menuRef?.current?.offsetWidth || 0)
    );
  }, [menuRef?.current, view, state]);

  return (
    <FloaterMenu ref={menuRef} style={styles}>
      {children}
    </FloaterMenu>
  );
};

const FloaterMenu = styled.div`
  position: fixed;
  z-index: 99;
  display: flex;
  background: white;
  box-shadow: 0px 0px 20px rgba(19, 48, 122, 0.1);
  border-radius: 4px;
`;
