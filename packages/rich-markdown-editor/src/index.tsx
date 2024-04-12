/* global window File Promise */
import * as React from "react";
import { Tooltip as AntdTooltip } from "antd";
import { createPortal } from "react-dom";
import memoize from "lodash/memoize";
import { EditorState, Selection, Plugin } from "prosemirror-state";
import { gapCursor } from "prosemirror-gapcursor";
import { MarkdownParser, MarkdownSerializer } from "prosemirror-markdown";
import { EditorView } from "prosemirror-view";
import { Schema, NodeSpec, MarkSpec, Slice } from "prosemirror-model";
import { inputRules, InputRule } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { selectColumn, selectRow, selectTable } from "prosemirror-utils";
import { ThemeProvider } from "styled-components";
import { light as lightTheme, dark as darkTheme } from "./styles/theme";
import baseDictionary from "./dictionary";
import Flex from "./components/Flex";
import { SearchResult } from "./components/LinkEditor";
import { EmbedDescriptor, HighlightType, ToastType } from "./types";
import SelectionToolbar from "./components/SelectionToolbar";
import LinkToolbar from "./components/LinkToolbar";
import Tooltip from "./components/Tooltip";
import Extension from "./lib/Extension";
import ExtensionManager from "./lib/ExtensionManager";
import ComponentView from "./lib/ComponentView";
import headingToSlug from "./lib/headingToSlug";

// styles
import { StyledEditor } from "./styles/editor";

// nodes
import ReactNode from "./nodes/ReactNode";
import Doc from "./nodes/Doc";
import Text from "./nodes/Text";
import Blockquote from "./nodes/Blockquote";
import BulletList from "./nodes/BulletList";
import CodeBlock from "./nodes/CodeBlock";
import CodeFence from "./nodes/CodeFence";
import CheckboxList from "./nodes/CheckboxList";
import CheckboxItem from "./nodes/CheckboxItem";
import Embed from "./nodes/Embed";
import HardBreak from "./nodes/HardBreak";
import Heading from "./nodes/Heading";
import HorizontalRule from "./nodes/HorizontalRule";
import Image from "./nodes/Image";
import ListItem from "./nodes/ListItem";
import Notice from "./nodes/Notice";
import OrderedList from "./nodes/OrderedList";
import Paragraph from "./nodes/Paragraph";
import Table from "./nodes/Table";
import TableCell from "./nodes/TableCell";
import TableHeadCell from "./nodes/TableHeadCell";
import TableRow from "./nodes/TableRow";

// marks
import Bold from "./marks/Bold";
import Code from "./marks/Code";
import Highlight from "./marks/Highlight";
import Italic from "./marks/Italic";
import Link from "./marks/Link";
import Strikethrough from "./marks/Strikethrough";
import TemplatePlaceholder from "./marks/Placeholder";
import Underline from "./marks/Underline";
import ColorText from "./marks/ColorText";

// plugins
import BlockMenuTrigger from "./plugins/BlockMenuTrigger";
import Folding from "./plugins/Folding";
import History from "./plugins/History";
import Keys from "./plugins/Keys";
import MaxLength from "./plugins/MaxLength";
import Placeholder from "./plugins/Placeholder";
import SmartText from "./plugins/SmartText";
import TrailingNode from "./plugins/TrailingNode";
import PasteHandler from "./plugins/PasteHandler";
import { PluginSimple } from "markdown-it";
import { CommandMenuV2 } from "./components/CommandMenu.v2";

import { dropCursor } from "./plugins/CustomDropCursor";
import { FORCE_UPDATE_KEY } from "./constant/metaKey";
import { dragHandler } from "./plugins/DragHandler";
import { CirclePlusIcon, DragIcon } from "./menus/icons";
import { getMarksBetween } from "./lib/markInputRule";
import { isEmpty } from "lodash";
import Annotation from "./plugins/Annotation";
import { isInWritingBlock } from "./queries/isInWritingBlock";

export { schema, parser, serializer, renderToHtml } from "./server";

export { default as Extension } from "./lib/Extension";
export { default as Node } from "./nodes/Node";

export const theme = lightTheme;

export function isVisibleAnnotation(view: EditorView): {
  visible: boolean;
  id: string;
  from: number;
  to: number;
} {
  const MARK_TYPE = "annotation";
  const { selection } = view.state;
  const { from, to } = selection;

  const checkedMark = getMarksBetween(from, to, view.state);
  const annotationMark = checkedMark.find(
    (m) => m.mark.type.name === MARK_TYPE
  );
  const isBelongToMarkRange =
    annotationMark &&
    from >= annotationMark.start &&
    from <= annotationMark.end;

  const id: string = annotationMark ? annotationMark.mark.attrs["id"] : "";

  if (isBelongToMarkRange && !isEmpty(id)) {
    return {
      visible: true,
      id,
      from: checkedMark[0].start,
      to: checkedMark[0].end,
    };
  } else {
    return { visible: false, id: "", from: 0, to: 0 };
  }
}

export type Props = {
  id?: string;
  value?: string;
  documentId?: string;
  defaultValue: string;
  placeholder: string;
  extensions?: Extension[];
  disableDragAndDrop?: boolean;
  disableFloatingMenu?: boolean;
  isEnablePageBlock?: boolean;
  disableExtensions?: (
    | "strong"
    | "code_inline"
    | "highlight"
    | "em"
    | "link"
    | "placeholder"
    | "strikethrough"
    | "underline"
    | "blockquote"
    | "bullet_list"
    | "checkbox_item"
    | "checkbox_list"
    | "code_block"
    | "code_fence"
    | "embed"
    | "br"
    | "heading"
    | "hr"
    | "image"
    | "list_item"
    | "container_notice"
    | "ordered_list"
    | "paragraph"
    | "table"
    | "td"
    | "th"
    | "tr"
    | "emoji"
    | "blockmenu"
  )[];
  autoFocus?: boolean;
  isFocusAtStart?: boolean;
  readOnly?: boolean;
  readOnlyWriteCheckboxes?: boolean;
  dictionary?: Partial<typeof baseDictionary>;
  dark?: boolean;
  dir?: string;
  theme?: typeof theme;
  template?: boolean;
  headingsOffset?: number;
  maxLength?: number;
  scrollTo?: string;
  handleDOMEvents?: {
    [name: string]: (view: EditorView, event: Event) => boolean;
  };
  uploadImage?: (file: File) => Promise<string>;
  onBlur?: () => void;
  onFocus?: () => void;
  onSave?: ({ done }: { done: boolean }) => void;
  onCancel?: () => void;
  onChange?: (value: () => string) => void;
  onImageUploadStart?: () => void;
  onImageUploadStop?: () => void;
  onCreateLink?: (title: string) => Promise<string>;
  onSearchLink?: (term: string) => Promise<SearchResult[]>;
  onClickLink: (href: string, event: MouseEvent) => void;
  onHoverLink?: (event: MouseEvent) => boolean;
  onClickHashtag?: (tag: string, event: MouseEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  embeds: EmbedDescriptor[];
  onShowToast?: (message: string, code: ToastType) => void;
  tooltip: typeof React.Component | React.FC<any>;
  className?: string;
  style?: React.CSSProperties;
  styledEditor?: React.CSSProperties;
  editorConfig?: any;
  getSchemaProps?: (schema: Schema) => void;
  getEditorView?: (editorView: EditorView) => void;
  getCommands?: (command: Record<string, any>) => void;
  openBlockMenuOutside?: boolean;
  blockMenuPosition?: DOMRectList;
  transformPasted?: ((p: Slice) => Slice) | null;
  onPastedFiles?: (files: FileList) => Promise<void> | void;
  getEditorRef?: (ref: RichMarkdownEditor) => void;
  activeDocumentEditorId?: (documentId: string) => void;
  watchEditorStateChange?: (state: EditorState, documentId?: string) => void;
  addHighlight?: (
    threadId: string,
    type: HighlightType,
    originalText?: string
  ) => Promise<void>;
  openFeedback?: (highlightId: string) => void;
};

type State = {
  isRTL: boolean;
  isEditorFocused: boolean;
  selectionMenuOpen: boolean;
  blockMenuOpen: boolean;
  linkMenuOpen: boolean;
  blockMenuSearch?: string;
  emojiMenuOpen: boolean;
  openDragTooltip?: boolean;
  openCircleTooltip?: boolean;
};

type Step = {
  slice?: Slice;
};

class RichMarkdownEditor extends React.PureComponent<Props, State> {
  static defaultProps = {
    defaultValue: "",
    dir: "auto",
    placeholder: baseDictionary.newLineEmpty,
    onImageUploadStart: () => {
      // no default behavior
    },
    onImageUploadStop: () => {
      // no default behavior
    },
    onClickLink: (href) => {
      window.open(href, "_blank");
    },
    embeds: [],
    extensions: [],
    tooltip: Tooltip,
  };

  state = {
    isRTL: false,
    isEditorFocused: false,
    selectionMenuOpen: false,
    blockMenuOpen: false,
    linkMenuOpen: false,
    blockMenuSearch: undefined,
    emojiMenuOpen: false,
    openDragTooltip: false,
    openCircleTooltip: false,
  };

  isBlurred: boolean;
  extensions: ExtensionManager;
  element?: HTMLElement | null;
  view: EditorView;
  schema: Schema;
  serializer: MarkdownSerializer;
  parser: MarkdownParser;
  pasteParser: MarkdownParser;
  plugins: Plugin[];
  keymaps: Plugin[];
  inputRules: InputRule[];
  nodeViews: {
    [name: string]: (node, view, getPos, decorations) => ComponentView;
  };
  nodes: { [name: string]: NodeSpec };
  marks: { [name: string]: MarkSpec };
  commands: Record<string, any>;
  rulePlugins: PluginSimple[];

  componentDidMount() {
    this.init();
    this.handleGetEditorRef();

    if (this.props.scrollTo) {
      this.scrollToAnchor(this.props.scrollTo);
    }

    this.calculateDir();

    if (this.props.readOnly) return;

    if (this.props.autoFocus) {
      this.focusAtStart();
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Allow changes to the 'value' prop to update the editor from outside
    if (this.props.value && prevProps.value !== this.props.value) {
      const newState = this.createState(this.props.value);
      this.view.updateState(newState);
    }

    if (
      this.props.defaultValue &&
      prevProps.defaultValue !== this.props.defaultValue
    ) {
      const newState = this.createState(this.props.defaultValue);
      this.view.updateState(newState);
    }

    // pass readOnly changes through to underlying editor instance
    if (prevProps.readOnly !== this.props.readOnly) {
      this.view.update({
        ...this.view.props,
        editable: () => !this.props.readOnly,
      });
    }

    if (this.props.scrollTo && this.props.scrollTo !== prevProps.scrollTo) {
      this.scrollToAnchor(this.props.scrollTo);
    }

    // Focus at the end of the document if switching from readOnly and autoFocus
    // is set to true
    if (prevProps.readOnly && !this.props.readOnly && this.props.autoFocus) {
      this.focusAtEnd();
    }

    if (prevProps.dir !== this.props.dir) {
      this.calculateDir();
    }

    if (
      !this.isBlurred &&
      !this.state.isEditorFocused &&
      !this.state.blockMenuOpen &&
      !this.state.linkMenuOpen &&
      !this.state.selectionMenuOpen
    ) {
      this.isBlurred = true;
      if (this.props.onBlur) {
        this.props.onBlur();
      }
    }

    if (
      this.isBlurred &&
      (this.state.isEditorFocused ||
        this.state.blockMenuOpen ||
        this.state.linkMenuOpen ||
        this.state.selectionMenuOpen)
    ) {
      this.isBlurred = false;
      if (this.props.onFocus) {
        this.props.onFocus();
      }
    }

    if (!prevProps.isFocusAtStart && this.props.isFocusAtStart) {
      // console.log(prevProps.isFocusAtStart, this.props.isFocusAtStart);
      this.focusAtStart();
    }

    // Can not close feedback right side bar
    // const { id } = isVisibleAnnotation(this.view);
    // if (this.props.openFeedback && id) {
    //   this.props.openFeedback(id);
    // }
  }

  init() {
    this.extensions = this.createExtensions();
    this.nodes = this.createNodes();
    this.marks = this.createMarks();
    this.schema = this.createSchema();
    this.plugins = this.createPlugins();
    this.rulePlugins = this.createRulePlugins();
    this.keymaps = this.createKeymaps();
    this.serializer = this.createSerializer();
    this.parser = this.createParser();
    this.pasteParser = this.createPasteParser();
    this.inputRules = this.createInputRules();
    this.nodeViews = this.createNodeViews();
    this.view = this.createView();
    this.commands = this.createCommands();

    if (this.props.getSchemaProps) this.props.getSchemaProps(this.schema);
    if (this.props.getEditorView) this.props.getEditorView(this.view);
    if (this.props.getCommands) this.props.getCommands(this.commands);
  }

  createExtensions(editor?: RichMarkdownEditor) {
    const dictionary = this.dictionary(this.props.dictionary);

    let linesCount = 1;
    const activeEditorEl = document.getElementById("active-editor");
    const titleEl = activeEditorEl?.getElementsByTagName("textarea");

    if (activeEditorEl && titleEl?.length) {
      const editorElHeight = window
        .getComputedStyle(activeEditorEl)
        .getPropertyValue("height");
      const titleElHeight = window
        .getComputedStyle(titleEl[0])
        .getPropertyValue("height");
      const realEmptySpace =
        parseFloat(editorElHeight.replace(/[^\d\.]*/g, "")) -
        parseFloat(titleElHeight.replace(/[^\d\.]*/g, ""));

      linesCount = Math.round(realEmptySpace / 28);
    }

    // adding nodes here? Update schema.ts for serialization on the server
    return new ExtensionManager(
      [
        ...[
          new Doc({ linesCount }),
          new HardBreak(),
          new Paragraph(),
          new Blockquote(),
          new CodeBlock({
            dictionary,
            onShowToast: this.props.onShowToast,
          }),
          new CodeFence({
            dictionary,
            onShowToast: this.props.onShowToast,
          }),
          new Text(),
          new CheckboxList(),
          new CheckboxItem(),
          new BulletList(),
          new Embed({ embeds: this.props.embeds }),
          new ListItem(),
          new Notice({
            dictionary,
            isReadOnly: this.props.readOnly,
          }),
          new Heading({
            dictionary,
            onShowToast: this.props.onShowToast,
            offset: this.props.headingsOffset,
          }),
          new HorizontalRule(),
          new Image({
            dictionary,
            uploadImage: this.props.uploadImage,
            onImageUploadStart: this.props.onImageUploadStart,
            onImageUploadStop: this.props.onImageUploadStop,
            onShowToast: this.props.onShowToast,
          }),
          new Table(),
          new TableCell({
            onSelectTable: this.handleSelectTable,
            onSelectRow: this.handleSelectRow,
          }),
          new TableHeadCell({
            onSelectColumn: this.handleSelectColumn,
          }),
          new TableRow(),
          new Bold(),
          new Code(),
          new Highlight(),
          new Italic(),
          new TemplatePlaceholder(),
          new Underline(),
          new Annotation(),
          new Strikethrough(),
          new ColorText(), // Add color for inline text.
          new Link({
            onKeyboardShortcut: this.handleOpenLinkMenu,
            onClickLink: this.props.onClickLink,
            onClickHashtag: this.props.onClickHashtag,
            onHoverLink: this.props.onHoverLink,
          }),
          new OrderedList(),
          new History(),
          new Folding(),
          new SmartText(),
          new TrailingNode(),
          new PasteHandler(),
          new Keys({
            onBlur: this.handleEditorBlur,
            onFocus: this.handleEditorFocus,
            onSave: this.handleSave,
            onSaveAndExit: this.handleSaveAndExit,
            onCancel: this.props.onCancel,
          }),
          new BlockMenuTrigger({
            dictionary,
            onOpen: this.handleOpenBlockMenu,
            onClose: this.handleCloseBlockMenu,
            search: this.state.blockMenuSearch,
          }),
          new Placeholder({
            placeholder: this.props.placeholder,
          }),
          new MaxLength({
            maxLength: this.props.maxLength,
          }),
        ].filter((extension) => {
          // Optionaly disable extensions
          if (this.props.disableExtensions) {
            return !(this.props.disableExtensions as string[]).includes(
              extension.name
            );
          }
          return true;
        }),
        ...(this.props.extensions || []),
      ] as any[],
      editor || this
    );
  }

  createPlugins() {
    return this.extensions.plugins;
  }

  createRulePlugins() {
    return this.extensions.rulePlugins;
  }

  createKeymaps() {
    return this.extensions.keymaps({
      schema: this.schema,
    });
  }

  createInputRules() {
    return this.extensions.inputRules({
      schema: this.schema,
    });
  }

  createNodeViews() {
    return this.extensions.extensions
      .filter((extension: ReactNode) => extension.component)
      .reduce((nodeViews, extension: ReactNode) => {
        const nodeView = (node, view, getPos, decorations) => {
          return new ComponentView(extension.component, {
            editor: this,
            extension,
            node,
            view,
            getPos,
            decorations,
          });
        };

        return {
          ...nodeViews,
          [extension.name]: nodeView,
        };
      }, {});
  }

  createCommands() {
    const commands = this.extensions.commands({
      schema: this.schema,
      view: this.view,
    });

    return commands;
  }

  createNodes() {
    return this.extensions.nodes;
  }

  createMarks() {
    return this.extensions.marks;
  }

  createSchema() {
    return new Schema({
      nodes: this.nodes,
      marks: this.marks,
    });
  }

  createSerializer() {
    return this.extensions.serializer();
  }

  createParser() {
    return this.extensions.parser({
      schema: this.schema,
      plugins: this.rulePlugins,
    });
  }

  createPasteParser() {
    return this.extensions.parser({
      schema: this.schema,
      rules: { linkify: true },
      plugins: this.rulePlugins,
    });
  }

  createState(value?: string) {
    const doc = this.createDocument(value || this.props.defaultValue);
    const basePlugins = [
      ...this.plugins,
      ...this.keymaps,
      dropCursor({ color: this.theme().cursor }),
      gapCursor(),
      inputRules({
        rules: this.inputRules,
      }),
      keymap(baseKeymap),
    ];

    return EditorState.create({
      schema: this.schema,
      doc,
      plugins:
        this.props.disableDragAndDrop || this.props.readOnly
          ? basePlugins
          : [...basePlugins, dragHandler(this.handleOpenBlockMenu)],
    });
  }

  createDocument(content: string) {
    return this.parser.parse(content);
  }

  createView() {
    if (!this.element) {
      throw new Error("createView called before ref available");
    }

    const isEditingCheckbox = (tr) => {
      return tr.steps.some(
        (step: Step) =>
          step.slice?.content?.firstChild?.type?.name ===
          this.schema.nodes.checkbox_item.name
      );
    };

    const updateUuid = (tr, zenBlockNode: string) => {
      return tr.steps.some(
        (step: Step) =>
          step.slice?.content?.firstChild?.type.name ===
          this.schema.nodes[zenBlockNode].name
      );
    };

    const existingAddRemoveMarkStep = (tr) => {
      // {from, to, stepType: addMark || removeMark, mark: {attrs: id, type}}
      return tr.steps.some(
        (step) =>
          step.toJSON()?.stepType === "addMark" ||
          step.toJSON()?.stepType === "removeMark"
      );
    };

    const self = this; // eslint-disable-line
    const view = new EditorView(this.element, {
      state: this.createState(this.props.value),
      editable: () => !this.props.readOnly,
      nodeViews: this.nodeViews || undefined,
      handleClickOn: (view) => {
        const { id } = isVisibleAnnotation(view);
        this.props.openFeedback && this.props.openFeedback(id);
        return false;
      },
      handleDOMEvents: this.props.handleDOMEvents,
      handlePaste: (
        view: EditorView,
        event: ClipboardEvent,
        slice: Slice<any>
      ) => {
        const files = event?.clipboardData?.files;

        if (files && files.length > 0 && this.props.onPastedFiles) {
          this.props.onPastedFiles(files);
        }

        if (event.type === "paste" && this.props.transformPasted) {
          this.props.transformPasted(slice);
        }
        return false;
      },
      dispatchTransaction: function (transaction) {
        // callback is bound to have the view instance as its this binding
        const { state, transactions } =
          this.state.applyTransaction(transaction);

        // Watch state update.
        self.handleWatchEditorStateChange(state);

        this.updateState(state);

        // Can input in writing block in case readonly property is true.
        if (self.props.readOnly) {
          this.setProps({
            editable: () =>
              isInWritingBlock(state) ? true : !self.props.readOnly,
          });
          self.handleChange();
        }

        // If any of the transactions being dispatched resulted in the doc
        // changing then call our own change handler to let the outside world
        // know
        const forceChange = transaction.getMeta(FORCE_UPDATE_KEY);
        const shouldUpdate =
          forceChange ||
          !self.props.readOnly ||
          transactions.some((tr) => updateUuid(tr, "page_block")) ||
          transactions.some((tr) => updateUuid(tr, "quiz_block")) ||
          transactions.some((tr) => existingAddRemoveMarkStep(tr)) ||
          (self.props.readOnlyWriteCheckboxes &&
            transactions.some(isEditingCheckbox));

        if (transactions.some((tr) => tr.docChanged) && shouldUpdate) {
          self.handleChange();
        }

        self.calculateDir();

        // Because Prosemirror and React are not linked we must tell React that
        // a render is needed whenever the Prosemirror state changes.
        self.forceUpdate();
      },
    });

    // Tell third-party libraries and screen-readers that this is an input
    view.dom.setAttribute("role", "textbox");

    return view;
  }

  handleGetEditorRef() {
    this.element && this.props.getEditorRef && this.props.getEditorRef(this);
  }

  handleGetActiveDocumentEditorId() {
    this.props.activeDocumentEditorId &&
      this.props.documentId &&
      this.props.activeDocumentEditorId(this.props.documentId);
  }

  handleWatchEditorStateChange(state: EditorState) {
    this.props.watchEditorStateChange &&
      this.props.watchEditorStateChange(state, this.props.documentId);
  }

  scrollToAnchor(hash: string) {
    if (!hash) return;

    try {
      const element = document.querySelector(hash);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      // querySelector will throw an error if the hash begins with a number
      // or contains a period. This is protected against now by safeSlugify
      // however previous links may be in the wild.
      console.warn(`Attempted to scroll to invalid hash: ${hash}`, err);
    }
  }

  calculateDir = () => {
    if (!this.element) return;

    const isRTL =
      this.props.dir === "rtl" ||
      getComputedStyle(this.element).direction === "rtl";

    if (this.state.isRTL !== isRTL) {
      this.setState({ isRTL });
    }
  };

  value = (): string | undefined => {
    try {
      return this.serializer.serialize(this.view.state.doc);
    } catch (e) {
      console.warn("Cannot serialize editor because", e);
    }
  };

  handleChange = () => {
    if (!this.props.onChange) return;

    this.props.onChange(() => {
      return this.value() || "";
    });
  };

  handleSave = () => {
    const { onSave } = this.props;
    if (onSave) {
      onSave({ done: false });
    }
  };

  handleSaveAndExit = () => {
    const { onSave } = this.props;
    if (onSave) {
      onSave({ done: true });
    }
  };

  handleEditorBlur = () => {
    this.setState({ isEditorFocused: false });
  };

  handleEditorFocus = () => {
    this.setState({ isEditorFocused: true });
    if (this.props.activeDocumentEditorId) {
      this.handleGetActiveDocumentEditorId();
    }
  };

  handleOpenSelectionMenu = () => {
    this.setState({ blockMenuOpen: false, selectionMenuOpen: true });
  };

  handleCloseSelectionMenu = () => {
    this.setState({ selectionMenuOpen: false });
  };

  handleOpenLinkMenu = () => {
    this.setState({ blockMenuOpen: false, linkMenuOpen: true });
  };

  handleCloseLinkMenu = () => {
    this.setState({ linkMenuOpen: false });
  };

  handleOpenBlockMenu = (search: string) => {
    const activeEditor = document.getElementById("active-editor");
    if (activeEditor) {
      activeEditor.style.overflow = "hidden";
    }
    this.setState({ blockMenuOpen: true, blockMenuSearch: search });
  };

  handleCloseBlockMenu = () => {
    const activeEditor = document.getElementById("active-editor");
    if (activeEditor) {
      activeEditor.style.overflow = "auto";
    }
    if (!this.state.blockMenuOpen) return;
    this.setState({ blockMenuOpen: false });
  };

  handleSelectRow = (index: number, state: EditorState) => {
    this.view.dispatch(selectRow(index)(state.tr));
  };

  handleSelectColumn = (index: number, state: EditorState) => {
    this.view.dispatch(selectColumn(index)(state.tr));
  };

  handleSelectTable = (state: EditorState) => {
    this.view.dispatch(selectTable(state.tr));
  };

  // 'public' methods
  focusAtStart = () => {
    const selection = Selection.atStart(this.view.state.doc);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  focusAtEnd = () => {
    const selection = Selection.atEnd(this.view.state.doc);
    const transaction = this.view.state.tr.setSelection(selection);
    this.view.dispatch(transaction);
    this.view.focus();
  };

  getHeadings = () => {
    const headings: {
      title: string;
      level: number;
      id: string;
      offset: number;
    }[] = [];
    const previouslySeen = {};

    this.view.state.doc.forEach((node, offset) => {
      if (node.type.name === "heading") {
        // calculate the optimal slug
        const slug = headingToSlug(node);
        let id = slug;

        // check if we've already used it, and if so how many times?
        // Make the new id based on that number ensuring that we have
        // unique ID's even when headings are identical
        if (previouslySeen[slug] > 0) {
          id = headingToSlug(node, previouslySeen[slug]);
        }

        // record that we've seen this slug for the next loop
        previouslySeen[slug] =
          previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;

        headings.push({
          title: node.textContent,
          level: node.attrs.level,
          id,
          offset,
        });
      }
    });
    return headings;
  };

  theme = () => {
    return this.props.theme || (this.props.dark ? darkTheme : lightTheme);
  };

  dictionary = memoize(
    (providedDictionary?: Partial<typeof baseDictionary>) => {
      return { ...baseDictionary, ...providedDictionary };
    }
  );

  render() {
    const {
      styledEditor,
      dir,
      readOnly,
      readOnlyWriteCheckboxes,
      style,
      tooltip,
      className,
      onKeyDown,
      disableFloatingMenu,
      isEnablePageBlock,
      editorConfig,
    } = this.props;
    const { isRTL, openDragTooltip, openCircleTooltip } = this.state;
    const dictionary = this.dictionary(this.props.dictionary);

    return (
      <Flex
        onKeyDown={onKeyDown}
        style={style}
        className={className}
        align="flex-start"
        justify="center"
        dir={dir}
        column
      >
        <ThemeProvider theme={this.theme()}>
          <React.Fragment>
            <StyledEditor
              isMobileView={disableFloatingMenu}
              id="rich-markdown-editor"
              style={styledEditor}
              dir={dir}
              rtl={isRTL}
              readOnly={readOnly}
              readOnlyWriteCheckboxes={readOnlyWriteCheckboxes}
              ref={(ref) => (this.element = ref)}
              spellCheck={false}
              editorConfig={editorConfig}
            />

            <div
              draggable
              id="dnd"
              style={{
                cursor: "grab",
                position: "absolute",
                top: 0,
                display: "none",
              }}
            >
              <AntdTooltip
                title={openCircleTooltip ? "Click to add below" : ""}
                arrow={false}
                placement="bottom"
              >
                <div
                  style={{ marginRight: 4 }}
                  id="trigger-slash-menu"
                  onMouseOver={() => this.setState({ openCircleTooltip: true })}
                  // onDragOver={() => this.setState({ openCircleTooltip: false })}
                  onMouseOut={() => this.setState({ openCircleTooltip: false })}
                >
                  <CirclePlusIcon />
                </div>
              </AntdTooltip>
              <AntdTooltip
                title={openDragTooltip ? "Drag to move" : ""}
                arrow={false}
                placement="bottom"
                mouseEnterDelay={0.3}
              >
                <div
                  onMouseOver={() => this.setState({ openDragTooltip: true })}
                  onMouseOut={() => this.setState({ openDragTooltip: false })}
                >
                  <DragIcon />
                </div>
              </AntdTooltip>
            </div>
            {this.view && !disableFloatingMenu && (
              <React.Fragment>
                <SelectionToolbar
                  readOnly={readOnly}
                  view={this.view}
                  dictionary={dictionary}
                  commands={this.commands}
                  rtl={isRTL}
                  isTemplate={this.props.template === true}
                  onOpen={this.handleOpenSelectionMenu}
                  onClose={this.handleCloseSelectionMenu}
                  onSearchLink={this.props.onSearchLink}
                  onClickLink={this.props.onClickLink}
                  onCreateLink={this.props.onCreateLink}
                  tooltip={tooltip}
                  addHighlight={(type, originalText) => {
                    const { id } = isVisibleAnnotation(this.view);
                    this.props.addHighlight &&
                      this.props.addHighlight(id, type, originalText);
                  }}
                />

                <LinkToolbar
                  view={this.view}
                  dictionary={dictionary}
                  isActive={this.state.linkMenuOpen}
                  onCreateLink={this.props.onCreateLink}
                  onSearchLink={this.props.onSearchLink}
                  onClickLink={this.props.onClickLink}
                  onShowToast={this.props.onShowToast}
                  onClose={this.handleCloseLinkMenu}
                  tooltip={tooltip}
                />

                {createPortal(
                  <CommandMenuV2
                    editorView={this.view}
                    commands={this.commands}
                    isSearchMode={this.state.blockMenuOpen}
                    isEnablePageBlock={isEnablePageBlock}
                    onClose={this.handleCloseBlockMenu}
                    search={this.state.blockMenuSearch}
                  />,
                  document.body
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        </ThemeProvider>
      </Flex>
    );
  }
}

export default RichMarkdownEditor;
