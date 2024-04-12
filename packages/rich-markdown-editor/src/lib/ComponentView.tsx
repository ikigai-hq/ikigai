import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { EditorView, Decoration } from "prosemirror-view";
import Extension from "../lib/Extension";
import { Node } from "prosemirror-model";
import { light as lightTheme, dark as darkTheme } from "../styles/theme";
import Editor from "../";

export type NodeComponentOptions = {
  node: Node;
  theme: typeof lightTheme;
  isSelected: boolean;
  isEditable: boolean;
  getPos: () => number;
  componentView: ComponentView;
};

type Component = (options: NodeComponentOptions) => React.ReactElement;

export default class ComponentView {
  component: Component;
  editor: Editor;
  extension: Extension;
  node: Node;
  view: EditorView;
  getPos: () => number;
  decorations: Decoration<{ [key: string]: any }>[];
  isSelected = false;
  dom: HTMLElement | null;
  root: Root;

  // See https://prosemirror.net/docs/ref/#view.NodeView
  constructor(
    component,
    { editor, extension, node, view, getPos, decorations }
  ) {
    this.component = component;
    this.editor = editor;
    this.extension = extension;
    this.getPos = getPos;
    this.decorations = decorations;
    this.node = node;
    this.view = view;
    this.dom = node.type.spec.inline
      ? document.createElement("span")
      : document.createElement("div");
    this.root = createRoot(this.dom);

    this.renderElement();
  }

  renderElement() {
    const { dark } = this.editor.props;
    const theme = this.editor.props.theme || (dark ? darkTheme : lightTheme);

    const children = this.component({
      theme,
      node: this.node,
      isSelected: this.isSelected,
      isEditable: this.view.editable,
      getPos: this.getPos,
      componentView: this,
    });

    this.root.render(
      <ThemeProvider theme={theme}>{children as any}</ThemeProvider>
    );
  }

  update(node) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    this.renderElement();
    return true;
  }

  selectNode() {
    if (this.view.editable) {
      this.isSelected = true;
      this.renderElement();
    }
  }

  deselectNode() {
    if (this.view.editable) {
      this.isSelected = false;
      this.renderElement();
    }
  }

  stopEvent() {
    return true;
  }

  destroy() {
    if (this.dom) {
      this.root.unmount();
    }
    this.dom = null;
  }

  ignoreMutation() {
    return true;
  }
}
