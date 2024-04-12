import { Schema } from "prosemirror-model";
import { keymap } from "prosemirror-keymap";
import { MarkdownParser } from "prosemirror-markdown";
import { MarkdownSerializer } from "./markdown/serializer";
import Editor from "../";
import Extension from "./Extension";
import makeRules from "./markdown/rules";
import Node from "../nodes/Node";
import Mark from "../marks/Mark";
import { PluginSimple } from "markdown-it";
import { ExtensionName } from "../types/extensions.enum";

export default class ExtensionManager {
  extensions: Extension[];
  disableDragAndDrop?: boolean;

  constructor(extensions: Extension[] = [], editor?: Editor) {
    if (editor) {
      extensions.forEach((extension) => {
        extension.bindEditor(editor);
      });
      this.disableDragAndDrop = editor.props.disableDragAndDrop;
    }

    this.extensions = extensions;
  }

  get nodes() {
    return this.extensions
      .filter((extension) => extension.type === "node")
      .reduce(
        (nodes, node: Node) => ({
          ...nodes,
          [node.name]: node.schema,
        }),
        {}
      );
  }

  serializer() {
    const nodes = this.extensions
      .filter((extension) => extension.type === "node")
      .reduce(
        (nodes, extension: Node) => ({
          ...nodes,
          [extension.name]: extension.toMarkdown,
        }),
        {}
      );

    const marks = this.extensions
      .filter((extension) => extension.type === "mark")
      .reduce(
        (marks, extension: Mark) => ({
          ...marks,
          [extension.name]: extension.toMarkdown,
        }),
        {}
      );

    const markdownSerializer = new MarkdownSerializer(nodes, marks);

    return markdownSerializer;
  }

  parser({
    schema,
    rules,
    plugins,
  }: {
    schema: any;
    rules?: Record<string, any>;
    plugins?: PluginSimple[];
  }): MarkdownParser {
    const tokens: Record<string, any> = this.extensions
      .filter(
        (extension) => extension.type === "mark" || extension.type === "node"
      )
      .reduce((nodes, extension: Node | Mark) => {
        const md = extension.parseMarkdown();
        if (!md) return nodes;

        return {
          ...nodes,
          [extension.markdownToken || extension.name]: md,
        };
      }, {});

    const markdownParser = new MarkdownParser(
      schema,
      makeRules({ rules, plugins }),
      tokens
    );

    // console.log("extension manager:", markdownParser);

    return markdownParser;
  }

  get marks() {
    return this.extensions
      .filter((extension) => extension.type === "mark")
      .reduce(
        (marks, { name, schema }: Mark) => ({
          ...marks,
          [name]: schema,
        }),
        {}
      );
  }

  get plugins() {
    return this.extensions
      .filter((extension) => "plugins" in extension)
      .reduce((allPlugins, { plugins }) => [...allPlugins, ...plugins], []);
  }

  get rulePlugins() {
    return this.extensions
      .filter((extension) => "rulePlugins" in extension)
      .reduce(
        (allRulePlugins, { rulePlugins }) => [
          ...allRulePlugins,
          ...rulePlugins,
        ],
        []
      );
  }

  keymaps({ schema }: { schema: Schema }) {
    const extensionKeymaps = this.extensions
      .filter((extension) => ["extension"].includes(extension.type))
      .filter((extension) => extension.keys)
      .map((extension) => extension.keys({ schema }));

    const nodeMarkKeymaps = this.extensions
      .filter((extension) => ["node", "mark"].includes(extension.type))
      .filter((extension) => extension.keys)
      .map((extension) =>
        extension.keys({
          type: schema[`${extension.type}s`][extension.name],
          schema,
        })
      );

    return [...extensionKeymaps, ...nodeMarkKeymaps].map(
      (keys: Record<string, any>) => keymap(keys)
    );
  }

  inputRules({ schema }: { schema: Schema }) {
    const extensionInputRules = this.extensions
      .filter((extension) => ["extension"].includes(extension.type))
      .filter((extension) => extension.inputRules)
      .map((extension) => extension.inputRules({ schema }));

    const nodeMarkInputRules = this.extensions
      .filter((extension) => ["node", "mark"].includes(extension.type))
      .filter((extension) => extension.inputRules)
      .map((extension) =>
        extension.inputRules({
          type: schema[`${extension.type}s`][extension.name],
          schema,
        })
      );

    return [...extensionInputRules, ...nodeMarkInputRules].reduce(
      (allInputRules, inputRules) => [...allInputRules, ...inputRules],
      []
    );
  }

  commands({ schema, view }) {
    const allowCommands = [
      ExtensionName.Annotation,
      ExtensionName.HighlightText,
    ];
    return this.extensions
      .filter((extension) => extension.commands)
      .reduce((allCommands, extension) => {
        const { name, type } = extension;
        const commands = {};
        const value = extension.commands({
          schema,
          ...(["node", "mark"].includes(type)
            ? {
                type: schema[`${type}s`][name],
              }
            : {}),
        });

        const apply = (callback, attrs) => {
          if (
            view.editable ||
            (!view.editable && allowCommands.includes(name as ExtensionName))
          ) {
            view.focus();
            return callback(attrs, view)(view.state, view.dispatch, view);
          }
        };

        const handle = (_name, _value) => {
          if (Array.isArray(_value)) {
            commands[_name] = (attrs) =>
              _value.forEach((callback) => apply(callback, attrs));
          } else if (typeof _value === "function") {
            commands[_name] = (attrs) => apply(_value, attrs);
          }
        };

        if (typeof value === "object") {
          Object.entries(value).forEach(([commandName, commandValue]) => {
            handle(commandName, commandValue);
          });
        } else {
          handle(name, value);
        }

        return {
          ...allCommands,
          ...commands,
        };
      }, {});
  }
}
